'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { BarChart3, TrendingUp, Users, MessageCircle, MousePointerClick, LogIn, Eye, HelpCircle, MapPin, ArrowDown, Smartphone, Monitor } from 'lucide-react';

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
    '/gastronomia': 'Gastronomía',
    '/lugares': 'Lugares',
    '/eventos': 'Eventos',
    '/apartamentos/nacarado': 'Nacarado',
    '/apartamentos/arrebol': 'Arrebol',
    '/apartamentos/arje': 'Arje',
};

const EVENT_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    page_view: { label: 'Vista de página', icon: <Eye size={14} />, color: 'bg-blue-100 text-blue-600' },
    apartment_view: { label: 'Vista de apto', icon: <Eye size={14} />, color: 'bg-emerald-100 text-emerald-600' },
    apartment_click: { label: 'Click en apto', icon: <MousePointerClick size={14} />, color: 'bg-emerald-100 text-emerald-600' },
    booking_form_open: { label: 'Abrió formulario', icon: <LogIn size={14} />, color: 'bg-amber-100 text-amber-600' },
    booking_inquiry: { label: 'Consulta reserva', icon: <MessageCircle size={14} />, color: 'bg-green-100 text-green-700' },
    booking_cta_click: { label: 'Click reservar', icon: <MousePointerClick size={14} />, color: 'bg-amber-100 text-amber-600' },
    hero_cta_click: { label: 'Click hero CTA', icon: <MousePointerClick size={14} />, color: 'bg-violet-100 text-violet-600' },
    whatsapp_click: { label: 'Click WhatsApp', icon: <MessageCircle size={14} />, color: 'bg-green-100 text-green-600' },
    email_click: { label: 'Click email', icon: <MessageCircle size={14} />, color: 'bg-sky-100 text-sky-600' },
    faq_open: { label: 'FAQ abierta', icon: <HelpCircle size={14} />, color: 'bg-purple-100 text-purple-600' },
    location_click: { label: 'Click ubicación', icon: <MapPin size={14} />, color: 'bg-orange-100 text-orange-600' },
};

// ─── Component ───

const AdminStats: React.FC = () => {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<TimeRange>('7d');

    const rangeDays = range === '7d' ? 7 : range === '30d' ? 30 : 90;

    // Fetch events from Firestore
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const since = Timestamp.fromDate(daysAgo(rangeDays));
                const q = query(
                    collection(db, 'analytics_events'),
                    where('timestamp', '>=', since),
                    orderBy('timestamp', 'desc'),
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

        // ─── Daily chart ───
        const chartDays = Math.min(rangeDays, 14); // max 14 bars
        const dailyViews: { label: string; count: number }[] = [];
        for (let i = chartDays - 1; i >= 0; i--) {
            const dayStart = daysAgo(i);
            const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
            dailyViews.push({
                label: fmtDate(dayStart),
                count: pageViews.filter(e => {
                    const d = e.timestamp.toDate();
                    return d >= dayStart && d < dayEnd;
                }).length,
            });
        }
        const maxDaily = Math.max(...dailyViews.map(d => d.count), 1);

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
            dailyViews,
            maxDaily,
            abandonRate,
            convertingAptViews,
            avgPagesBeforeBooking,
            mobileCount,
            desktopCount,
            topFaqs,
            recentEvents: events.slice(0, 15),
        };
    }, [events, rangeDays]);

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
            <div className="flex gap-2">
                {(['7d', '30d', '90d'] as TimeRange[]).map(r => (
                    <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`px-4 py-2 text-xs font-ui tracking-widest rounded-lg transition-all ${range === r ? 'bg-forest text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                    >
                        {r === '7d' ? '7 DÍAS' : r === '30d' ? '30 DÍAS' : '90 DÍAS'}
                    </button>
                ))}
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
                {/* Daily Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                        <BarChart3 size={14} /> VISITAS POR DÍA
                    </h3>
                    <div className="flex items-end gap-1 h-48 pb-6 px-1 mt-2">
                        {stats.dailyViews.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                                <span className="text-[10px] text-gray-400 font-mono mb-1">{d.count || ''}</span>
                                <div className="w-full flex-1 relative">
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-forest to-sage rounded-t-md transition-all duration-500 hover:opacity-80 min-h-[2px]"
                                        style={{ height: `${stats.maxDaily > 0 ? (d.count / stats.maxDaily) * 100 : 0}%` }}
                                        title={`${d.label}: ${d.count} visitas`}
                                    />
                                </div>
                                <div className="relative w-full h-0 mt-2">
                                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 rotate-[-45deg] origin-top-left whitespace-nowrap">{d.label}</span>
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

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-ui text-xs tracking-widest text-gray-400 mb-4">🕐 ÚLTIMAS ACCIONES</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {stats.recentEvents.map((e, i) => {
                        const meta = EVENT_LABELS[e.event] || { label: e.event, icon: <Eye size={14} />, color: 'bg-gray-100 text-gray-500' };
                        const time = e.timestamp?.toDate();
                        const detail = e.event === 'apartment_view' || e.event === 'apartment_click'
                            ? e.params?.apartment
                            : e.event === 'faq_open'
                                ? e.params?.question?.slice(0, 40) + '...'
                                : e.event === 'page_view'
                                    ? (PAGE_LABELS[e.page] || e.page)
                                    : e.params?.location || '';
                        return (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                                <span className={`p-1.5 rounded-lg ${meta.color}`}>{meta.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-gray-700">{meta.label}</span>
                                    {detail && <span className="text-xs text-gray-400 ml-2">{detail}</span>}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {e.isMobile ? <Smartphone size={12} className="text-gray-300" /> : <Monitor size={12} className="text-gray-300" />}
                                    <span className="text-[10px] text-gray-300 font-mono">
                                        {time ? time.toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {stats.recentEvents.length === 0 && <p className="text-sm text-gray-400 italic py-4 text-center">Sin actividad aún. Navegá el sitio para generar eventos.</p>}
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






