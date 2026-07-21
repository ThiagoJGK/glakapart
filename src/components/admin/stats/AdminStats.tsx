'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BarChart3, TrendingUp, Users, MessageCircle, Eye, ArrowDown, Smartphone, Monitor, Bot } from 'lucide-react';

// ─── Types ───

interface AnalyticsEvent {
    event: string;
    params: Record<string, any>;
    sessionId: string;
    visitorId: string;
    page: string;
    referrer: string;
    isMobile: boolean;
    timestamp: Timestamp;
}

type TimeRange = '7d' | '30d' | '90d';

// ─── Helpers ───

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
}

function fmtDate(d: Date): string {
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

function percentage(part: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
}

const PAGE_LABELS: Record<string, string> = {
    '/': 'Inicio',
    '/links': 'Enlaces CTA (/links)',
    '/gastronomia': 'Gastronomía',
    '/lugares': 'Lugares',
    '/eventos': 'Eventos',
    '/apartamentos/nacarado': 'Nacarado',
    '/apartamentos/arrebol': 'Arrebol',
    '/apartamentos/arje': 'Arje',
};

// EVENT_LABELS removed (Timeline deleted)

// ─── Component ───

const AdminStats: React.FC = () => {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<TimeRange>('7d');
    const [viewType, setViewType] = useState<'daily'|'monthly'>('daily');

    const rangeDays = range === '7d' ? 7 : range === '30d' ? 30 : 90;

    // Fetch events from Firestore with limit to ensure performance
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const since = Timestamp.fromDate(daysAgo(rangeDays));
                const queryLimit = rangeDays === 7 ? 1000 : rangeDays === 30 ? 3000 : 5000;
                const q = query(
                    collection(db, 'analytics_events'),
                    where('timestamp', '>=', since),
                    orderBy('timestamp', 'desc'),
                    limit(queryLimit)
                );
                const snap = await getDocs(q);
                setEvents(snap.docs.map(d => d.data() as AnalyticsEvent));
            } catch (e) {
                console.warn('Error loading analytics:', e);
            }
            setLoading(false);
        };
        fetch();
    }, [rangeDays]);

    // ─── Computed Stats ───

    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const weekStart = daysAgo(7);

        const pageViews = events.filter(e => e.event === 'page_view');
        const todayViews = pageViews.filter(e => e.timestamp.toDate() >= todayStart);
        const weekViews = pageViews.filter(e => e.timestamp.toDate() >= weekStart);

        // Unique sessions & visitors
        const uniqueSessions = new Set(events.map(e => e.sessionId));
        const uniqueVisitors = new Set(events.map(e => e.visitorId));

        // Conversions
        const bookingInquiries = events.filter(e => e.event === 'booking_inquiry');
        const whatsappClicks = events.filter(e => e.event === 'whatsapp_click');
        const emailClicks = events.filter(e => e.event === 'email_click');
        const formOpens = events.filter(e => e.event === 'booking_form_open');

        // Conversion rate
        const convRate = uniqueSessions.size > 0
            ? ((bookingInquiries.length / uniqueSessions.size) * 100).toFixed(1)
            : '0';

        // ─── Top Pages ───
        const pageCounts: Record<string, number> = {};
        pageViews.forEach(e => { pageCounts[e.page] = (pageCounts[e.page] || 0) + 1; });
        const topPages = Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        // ─── Top Apartments ───
        const aptViews: Record<string, number> = {};
        events.filter(e => e.event === 'apartment_view').forEach(e => {
            const apt = e.params?.apartment;
            if (apt) aptViews[apt] = (aptViews[apt] || 0) + 1;
        });
        const aptInquirySessions = new Set(bookingInquiries.map(e => e.sessionId));
        const aptBooked: Record<string, number> = {};
        events.filter(e => e.event === 'apartment_view' && aptInquirySessions.has(e.sessionId)).forEach(e => {
            const apt = e.params?.apartment;
            if (apt) aptBooked[apt] = (aptBooked[apt] || 0) + 1;
        });

        // ─── Funnel ───
        const funnelSessions = {
            visited: uniqueSessions.size,
            viewedApt: new Set(events.filter(e => e.event === 'apartment_view').map(e => e.sessionId)).size,
            openedForm: new Set(formOpens.map(e => e.sessionId)).size,
            inquired: new Set(bookingInquiries.map(e => e.sessionId)).size,
        };

        // ─── Chart Data ───
        const chartData: { label: string; labelLine1: string; labelLine2: string; count: number }[] = [];
        if (viewType === 'daily') {
            const chartDays = Math.min(rangeDays, 14); // max 14 bars
            for (let i = chartDays - 1; i >= 0; i--) {
                const dayStart = daysAgo(i);
                const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
                const weekday = dayStart.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '');
                const day = dayStart.getDate().toString();
                chartData.push({
                    label: `${weekday} ${day}`,
                    labelLine1: weekday,
                    labelLine2: day,
                    count: pageViews.filter(e => {
                        const d = e.timestamp.toDate();
                        return d >= dayStart && d < dayEnd;
                    }).length,
                });
            }
        } else {
            // monthly grouping
            const numMonths = range === '90d' ? 3 : range === '30d' ? 2 : 1;
            for (let i = numMonths - 1; i >= 0; i--) {
                const monthDate = new Date(now);
                monthDate.setMonth(monthDate.getMonth() - i);
                const month = monthDate.getMonth();
                const year = monthDate.getFullYear();
                const monthName = monthDate.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '');
                const yearStr = monthDate.toLocaleDateString('es-AR', { year: '2-digit' });
                chartData.push({
                    label: `${monthName} ${yearStr}`,
                    labelLine1: monthName,
                    labelLine2: `'${yearStr}`,
                    count: pageViews.filter(e => {
                        const d = e.timestamp.toDate();
                        return d.getMonth() === month && d.getFullYear() === year;
                    }).length,
                });
            }
        }
        const maxDaily = Math.max(...chartData.map(d => d.count), 1);

        // ─── Behavioral Insights ───
        // Abandonment: opened form but no inquiry in same session
        const formOpenSessions = new Set(formOpens.map(e => e.sessionId));
        const inquirySessions = new Set(bookingInquiries.map(e => e.sessionId));
        const abandonedSessions = [...formOpenSessions].filter(s => !inquirySessions.has(s));
        const abandonRate = formOpenSessions.size > 0
            ? Math.round((abandonedSessions.length / formOpenSessions.size) * 100)
            : 0;

        // Cross-interest: sessions that viewed apt X but booked from apt Y context
        // Simplified: which apts did converting sessions view?
        const convertingAptViews: Record<string, number> = {};
        events.filter(e => e.event === 'apartment_view' && inquirySessions.has(e.sessionId)).forEach(e => {
            const apt = e.params?.apartment;
            if (apt) convertingAptViews[apt] = (convertingAptViews[apt] || 0) + 1;
        });

        // Average pages before booking
        const pagesBeforeBooking: number[] = [];
        inquirySessions.forEach(sid => {
            const sessionEvents = events.filter(e => e.sessionId === sid && e.event === 'page_view');
            pagesBeforeBooking.push(sessionEvents.length);
        });
        const avgPagesBeforeBooking = pagesBeforeBooking.length > 0
            ? (pagesBeforeBooking.reduce((a, b) => a + b, 0) / pagesBeforeBooking.length).toFixed(1)
            : '0';

        // Mobile vs Desktop
        const mobileCount = events.filter(e => e.event === 'page_view' && e.isMobile).length;
        const desktopCount = events.filter(e => e.event === 'page_view' && !e.isMobile).length;

        // Top FAQs
        const faqCounts: Record<string, number> = {};
        events.filter(e => e.event === 'faq_open').forEach(e => {
            const q = e.params?.question || 'Desconocida';
            faqCounts[q] = (faqCounts[q] || 0) + 1;
        });
        const topFaqs = Object.entries(faqCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // ─── Chatbot Stats ───
        const chatbotResponses = events.filter(e => e.event === 'chatbot_response');
        const chatbotSuccesses = chatbotResponses.filter(e => e.params?.success === true);
        const chatbotErrors = chatbotResponses.filter(e => e.params?.success === false);
        const chatbotEventInquiries = events.filter(e => e.event === 'chatbot_event_inquiry');
        const chatbotBookingReady = events.filter(e => e.event === 'chatbot_booking_ready');
        const chatbotWhatsAppClicks = events.filter(e => e.event === 'chatbot_whatsapp_click');

        // Provider distribution
        const providerCounts: Record<string, number> = {};
        chatbotResponses.forEach(e => {
            const p = e.params?.provider || 'Desconocido';
            providerCounts[p] = (providerCounts[p] || 0) + 1;
        });
        const providerStats = Object.entries(providerCounts).sort((a, b) => b[1] - a[1]);
        const chatSessions = new Set(chatbotResponses.map(e => e.sessionId)).size;

        // /links specific analytics
        const linksPageViews = pageViews.filter(e => e.page === '/links').length;
        const linksWhatsappClicks = events.filter(e => e.event === 'links_whatsapp_click').length;
        const linksSiteClicks = events.filter(e => e.event === 'links_site_click').length;
        const linksCalendarToggles = events.filter(e => e.event === 'links_calendar_toggle').length;
 
        return {
            pageViews: pageViews.length,
            todayViews: todayViews.length,
            weekViews: weekViews.length,
            uniqueSessions: uniqueSessions.size,
            uniqueVisitors: uniqueVisitors.size,
            bookingInquiries: bookingInquiries.length,
            whatsappClicks: whatsappClicks.length,
            emailClicks: emailClicks.length,
            convRate,
            topPages,
            aptViews,
            aptBooked,
            funnelSessions,
            chartData,
            maxDaily,
            abandonRate,
            convertingAptViews,
            avgPagesBeforeBooking,
            mobileCount,
            desktopCount,
            linksPageViews,
            linksWhatsappClicks,
            linksSiteClicks,
            linksCalendarToggles,
            // Chatbot entries
            chatbotTotal: chatbotResponses.length,
            chatbotSuccess: chatbotSuccesses.length,
            chatbotError: chatbotErrors.length,
            chatbotEvents: chatbotEventInquiries.length,
            chatbotReady: chatbotBookingReady.length,
            chatbotWAClicks: chatbotWhatsAppClicks.length,
            chatbotSessions: chatSessions,
            providerStats,
        };
    }, [events, rangeDays, viewType]);

    // ─── Render ───

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <BarChart3 className="w-10 h-10 text-forest animate-pulse mx-auto mb-3" />
                    <p className="text-sm text-gray-400 tracking-widest">CARGANDO DATOS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Range Selector */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex gap-2">
                    {(['7d', '30d', '90d'] as TimeRange[]).map(r => (
                        <button
                            key={r}
                            onClick={() => { setRange(r); if (r === '7d') setViewType('daily'); }}
                            className={`px-4 py-2 text-xs font-ui tracking-widest rounded-lg transition-all ${range === r ? 'bg-forest text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            {r === '7d' ? '7 DÍAS' : r === '30d' ? '30 DÍAS' : '90 DÍAS'}
                        </button>
                    ))}
                </div>
                {range !== '7d' && (
                    <div className="flex gap-2 border border-gray-100 p-1 rounded-lg bg-gray-50">
                        <button
                            onClick={() => setViewType('daily')}
                            className={`px-3 py-1.5 text-[10px] font-bold tracking-widest rounded-md transition-all ${viewType === 'daily' ? 'bg-white shadow text-forest' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            POR DÍA
                        </button>
                        <button
                            onClick={() => setViewType('monthly')}
                            className={`px-3 py-1.5 text-[10px] font-bold tracking-widest rounded-md transition-all ${viewType === 'monthly' ? 'bg-white shadow text-forest' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            POR MES
                        </button>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={<Eye />} label="Visitas" value={stats.pageViews} sub={`Hoy: ${stats.todayViews} · Semana: ${stats.weekViews}`} color="bg-blue-50 text-blue-600" />
                <KPICard icon={<Users />} label="Visitantes Únicos" value={stats.uniqueVisitors} sub={`${stats.uniqueSessions} sesiones`} color="bg-violet-50 text-violet-600" />
                <KPICard icon={<MessageCircle />} label="Consultas Reserva" value={stats.bookingInquiries} sub={`WA: ${stats.whatsappClicks} · Email: ${stats.emailClicks}`} color="bg-green-50 text-green-600" />
                <KPICard icon={<TrendingUp />} label="Tasa Conversión" value={`${stats.convRate}%`} sub={`${stats.bookingInquiries} de ${stats.uniqueSessions} sesiones`} color="bg-amber-50 text-amber-600" />
            </div>

            {/* Chart + Funnel Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily/Monthly Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-6 flex items-center gap-2 uppercase">
                        <BarChart3 size={14} /> VISITAS {viewType === 'daily' ? 'POR DÍA' : 'POR MES'}
                    </h3>
                    <div className="flex items-end gap-2 h-48 pb-8 px-1 mt-2">
                        {stats.chartData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                                <span className="text-[10px] text-gray-400 font-mono mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.count || ''}</span>
                                <div className="w-full flex-1 relative">
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-forest to-sage rounded-t-md transition-all duration-500 group-hover:opacity-80 min-h-[4px]"
                                        style={{ height: `${stats.maxDaily > 0 ? (d.count / stats.maxDaily) * 100 : 0}%` }}
                                        title={`${d.label}: ${d.count} visitas`}
                                    />
                                </div>
                                <div className="mt-2 flex flex-col items-center leading-none text-center">
                                    <span className="text-[9px] text-gray-400 capitalize">{d.labelLine1}</span>
                                    <span className="text-[10px] text-gray-500 font-bold mt-1">{d.labelLine2}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <ArrowDown size={14} /> FUNNEL DE CONVERSIÓN
                    </h3>
                    <div className="space-y-3">
                        <FunnelStep label="Visitaron el sitio" value={stats.funnelSessions.visited} max={stats.funnelSessions.visited} color="bg-blue-400" />
                        <FunnelStep label="Vieron un apartamento" value={stats.funnelSessions.viewedApt} max={stats.funnelSessions.visited} color="bg-emerald-400" />
                        <FunnelStep label="Abrieron formulario" value={stats.funnelSessions.openedForm} max={stats.funnelSessions.visited} color="bg-amber-400" />
                        <FunnelStep label="Consultaron reserva" value={stats.funnelSessions.inquired} max={stats.funnelSessions.visited} color="bg-green-500" />
                    </div>
                </div>
            </div>

            {/* Apartments + Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Apartment Analysis */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-6">🏠 APARTAMENTOS</h3>
                    <div className="space-y-4">
                        {['nacarado', 'arrebol', 'arje'].map(apt => {
                            const views = stats.aptViews[apt] || 0;
                            const booked = stats.aptBooked[apt] || 0;
                            const vals = Object.values(stats.aptViews) as number[];
                            const maxV = vals.length > 0 ? Math.max(...vals) : 1;
                            return (
                                <div key={apt} className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-script text-2xl text-forest capitalize">{apt}</span>
                                        <span className="text-xs text-gray-400">{views} vistas · {booked} reservas</span>
                                    </div>
                                    <div className="flex gap-1 h-3">
                                        <div className="bg-forest/20 rounded-full overflow-hidden flex-1" title={`${views} vistas`}>
                                            <div className="h-full bg-forest rounded-full transition-all duration-700" style={{ width: `${(views / maxV) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Behavioral Insights */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-6">🧠 INSIGHTS DE COMPORTAMIENTO</h3>
                    <div className="space-y-4">
                        <InsightCard
                            emoji="🚪"
                            title="Abandono del formulario"
                            value={`${stats.abandonRate}%`}
                            description="de sesiones abren el formulario pero no consultan"
                            severity={stats.abandonRate > 70 ? 'high' : stats.abandonRate > 40 ? 'medium' : 'low'}
                        />
                        <InsightCard
                            emoji="📄"
                            title="Páginas antes de reservar"
                            value={stats.avgPagesBeforeBooking}
                            description="páginas visitadas en promedio antes de consultar"
                            severity="neutral"
                        />
                        <InsightCard
                            emoji="📱"
                            title="Mobile vs Desktop"
                            value={percentage(stats.mobileCount, stats.mobileCount + stats.desktopCount)}
                            description={`mobile (${stats.mobileCount}) vs desktop (${stats.desktopCount})`}
                            severity="neutral"
                            icon={<div className="flex gap-2 text-gray-400"><Smartphone size={14} /><Monitor size={14} /></div>}
                        />
                    </div>
                </div>
            </div>

            {/* 🤖 Glak Bot Statistics Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-ui text-sm font-bold tracking-widest text-gray-700">🤖 GLAK BOT - ASISTENTE IA</h3>
                        <p className="text-xs text-gray-400">Rendimiento técnico, embudo de conversión y consultas sobre Urdinarrain</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Rendimiento Técnico */}
                    <div className="space-y-4">
                        <h4 className="font-ui text-[10px] font-bold tracking-wider text-gray-400 uppercase">Rendimiento Técnico e Inteligencias</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-gray-800">{stats.chatbotTotal}</p>
                                <p className="text-[9px] text-gray-400 font-ui uppercase">Mensajes Totales</p>
                            </div>
                            <div className="bg-green-50/50 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-green-700">{stats.chatbotSuccess}</p>
                                <p className="text-[9px] text-green-600 font-ui uppercase">Aciertos IA</p>
                            </div>
                            <div className="bg-red-50/50 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-red-700">{stats.chatbotError}</p>
                                <p className="text-[9px] text-red-600 font-ui uppercase">Fallbacks / Saturación</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500">Distribución de Respuestas por IA:</p>
                            <div className="space-y-2">
                                {stats.providerStats.map(([provider, count]) => {
                                    const pct = stats.chatbotTotal > 0 ? Math.round((count / stats.chatbotTotal) * 100) : 0;
                                    let color = "bg-teal-500";
                                    let displayName = provider;
                                    
                                    if (provider.startsWith("gemini")) {
                                        color = "bg-blue-500";
                                        displayName = `Google Gemini (${provider.replace("gemini-key-", "Clave ")}`;
                                    } else if (provider === "nvidia") {
                                        color = "bg-green-600";
                                        displayName = "NVIDIA Llama 3.1 8B";
                                    } else if (provider === "groq") {
                                        color = "bg-orange-500";
                                        displayName = "Groq Llama 3.1 8B";
                                    } else if (provider === "openrouter") {
                                        color = "bg-purple-500";
                                        displayName = "OpenRouter Llama 3.3 70B";
                                    } else if (provider === "static-fallback") {
                                        color = "bg-gray-400";
                                        displayName = "Mensaje Estático (Contingencia)";
                                    } else if (provider === "network-error" || provider === "rate-limit") {
                                        color = "bg-red-400";
                                        displayName = provider === "rate-limit" ? "Límite de IP Superado" : "Error de Conexión";
                                    }

                                    return (
                                        <div key={provider} className="text-xs">
                                            <div className="flex justify-between text-[10px] mb-0.5">
                                                <span className="text-gray-600 font-medium">{displayName}</span>
                                                <span className="text-gray-500 font-mono font-bold">{count} ({pct}%)</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {stats.providerStats.length === 0 && (
                                    <p className="text-xs text-gray-400 italic py-4 text-center">Sin actividad en el chat registrada en este rango</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rendimiento Conversacional (Funnel) */}
                    <div className="space-y-4">
                        <h4 className="font-ui text-[10px] font-bold tracking-wider text-gray-400 uppercase">Embudo de Conversión del Bot</h4>
                        
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">💬</span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Conversaciones Iniciadas</p>
                                        <p className="text-[10px] text-gray-400">Sesiones únicas de usuarios en el chat</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-gray-800 font-mono">{stats.chatbotSessions}</p>
                            </div>

                            <div className="flex items-center justify-between bg-teal-50/30 rounded-xl p-3 border border-teal-100/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📝</span>
                                    <div>
                                        <p className="text-xs font-bold text-teal-800">Reservas Completadas</p>
                                        <p className="text-[10px] text-teal-600">Usuarios que aportaron todos sus datos</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-teal-700 font-mono">
                                    {stats.chatbotReady} <span className="text-[10px] font-normal text-teal-500">({percentage(stats.chatbotReady, stats.chatbotSessions)})</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-between bg-green-50/30 rounded-xl p-3 border border-green-100/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📲</span>
                                    <div>
                                        <p className="text-xs font-bold text-green-800">WhatsApp Enviados</p>
                                        <p className="text-[10px] text-green-600">Clics finales al botón "Enviar Consulta"</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-green-700 font-mono">
                                    {stats.chatbotWAClicks} <span className="text-[10px] font-normal text-green-500">({percentage(stats.chatbotWAClicks, stats.chatbotSessions)})</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-between bg-violet-50/30 rounded-xl p-3 border border-violet-100/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🎉</span>
                                    <div>
                                        <p className="text-xs font-bold text-violet-800">Consultas sobre Eventos Locales</p>
                                        <p className="text-[10px] text-violet-600">Preguntas sobre qué hacer o la agenda de Urdinarrain</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-violet-700 font-mono">{stats.chatbotEvents}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rendimiento Sección Enlaces (/links) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div>
                        <h3 className="font-ui text-xs tracking-widest text-[#10595a] uppercase font-bold flex items-center gap-2">
                            <span>🔗 MÉTRICAS SECCIÓN ENLACES (/links)</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Rendimiento de los botones CTA e interacción desde redes sociales y QR</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full self-start sm:self-auto">
                        {stats.linksPageViews} vistas a /links
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-900">Contacto WhatsApp</p>
                            <p className="text-[10px] text-emerald-600">Clics en botón verde WhatsApp</p>
                        </div>
                        <p className="text-xl font-bold text-emerald-700 font-mono">{stats.linksWhatsappClicks}</p>
                    </div>

                    <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-teal-900">Visitá Nuestra Página</p>
                            <p className="text-[10px] text-teal-600">Redirecciones al sitio principal (/)</p>
                        </div>
                        <p className="text-xl font-bold text-teal-700 font-mono">{stats.linksSiteClicks}</p>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-900">Consultar Disponibilidad</p>
                            <p className="text-[10px] text-amber-600">Aperturas del calendario interactivo</p>
                        </div>
                        <p className="text-xl font-bold text-amber-700 font-mono">{stats.linksCalendarToggles}</p>
                    </div>
                </div>
            </div>

            {/* Top Pages + Top FAQs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-4">📊 PÁGINAS MÁS VISITADAS</h3>
                    <div className="space-y-2">
                        {stats.topPages.map(([page, count], i) => (
                            <div key={page} className="flex items-center gap-3">
                                <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex justify-between">
                                    <span className="text-sm text-gray-700">{PAGE_LABELS[page] || page}</span>
                                    <span className="text-xs text-gray-400 font-mono">{count}</span>
                                </div>
                            </div>
                        ))}
                        {stats.topPages.length === 0 && <p className="text-sm text-gray-400 italic">Sin datos aún</p>}
                    </div>
                </div>

                {/* Top FAQs */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-4">❓ PREGUNTAS MÁS ABIERTAS</h3>
                    <div className="space-y-2">
                        {stats.topFaqs.map(([q, count], i) => (
                            <div key={q} className="flex items-center gap-3">
                                <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 flex justify-between gap-2">
                                    <span className="text-sm text-gray-700 line-clamp-1">{q}</span>
                                    <span className="text-xs text-gray-400 font-mono shrink-0">{count}</span>
                                </div>
                            </div>
                        ))}
                        {stats.topFaqs.length === 0 && <p className="text-sm text-gray-400 italic">Sin datos aún</p>}
                    </div>
                </div>
            </div>


        </div>
    );
};

// ─── Sub-components ───

const KPICard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub: string; color: string }> = ({ icon, label, value, sub, color }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
            {icon}
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs tracking-widest text-gray-400 font-ui mt-1">{label.toUpperCase()}</p>
        <p className="text-[11px] text-gray-400 mt-2">{sub}</p>
    </div>
);

const FunnelStep: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs">
            <span className="text-gray-600">{label}</span>
            <span className="text-gray-400 font-mono">{value} ({percentage(value, max)})</span>
        </div>
        <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
        </div>
    </div>
);

const InsightCard: React.FC<{ emoji: string; title: string; value: string; description: string; severity: 'high' | 'medium' | 'low' | 'neutral'; icon?: React.ReactNode }> = ({ emoji, title, value, description, severity, icon }) => {
    const borderColor = severity === 'high' ? 'border-l-red-400' : severity === 'medium' ? 'border-l-amber-400' : severity === 'low' ? 'border-l-green-400' : 'border-l-gray-300';
    return (
        <div className={`border-l-4 ${borderColor} bg-gray-50 rounded-r-xl px-4 py-3`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{emoji}</span>
                <span className="text-xs font-ui tracking-wider text-gray-500">{title}</span>
                {icon}
            </div>
            <p className="text-xl font-bold text-gray-800">{value} <span className="text-xs font-normal text-gray-400">{description}</span></p>
        </div>
    );
};

export default AdminStats;






