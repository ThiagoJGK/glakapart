'use client';
import React, { useState, useEffect } from 'react';
import { 
    subscribeToInquiries, 
    updateInquiryStatus, 
    updateInquiryNotes, 
    seedSampleInquiries,
    Inquiry 
} from '@/services/inquiries';
import { 
    Search, 
    Filter, 
    MessageSquare, 
    Calendar, 
    Users, 
    User, 
    Phone, 
    Mail, 
    MessageCircle, 
    FileText, 
    CheckCircle2, 
    Clock, 
    BookOpen, 
    ChevronRight, 
    ChevronDown, 
    Database, 
    Archive,
    Check,
    Save,
    ExternalLink,
    X
} from 'lucide-react';
import { Toast } from '../ui/Toast';

const STATUS_LABELS: Record<Inquiry['status'], string> = {
    new: 'Nueva',
    read: 'Leída',
    contacted: 'Contactado',
    confirmed: 'Confirmada',
    archived: 'Archivada'
};

const STATUS_COLORS: Record<Inquiry['status'], { bg: string; text: string; border: string; iconBg: string }> = {
    new: {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        iconBg: 'bg-amber-400'
    },
    read: {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        iconBg: 'bg-purple-400'
    },
    contacted: {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        iconBg: 'bg-blue-400'
    },
    confirmed: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-400'
    },
    archived: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        iconBg: 'bg-gray-400'
    }
};

interface Guest {
    fullName: string;
    email: string;
    phone: string;
    inquiries: Inquiry[];
}

export const AdminGuests: React.FC = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI state
    const [activeSubTab, setActiveSubTab] = useState<'solicitudes' | 'agenda'>('solicitudes');
    const [statusFilter, setStatusFilter] = useState<Inquiry['status'] | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
    const [expandedGuestPhone, setExpandedGuestPhone] = useState<string | null>(null);
    
    // Notes state for selected inquiry
    const [adminNotes, setAdminNotes] = useState('');
    const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Subscribe to inquiries
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToInquiries((data) => {
            setInquiries(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Keep adminNotes input in sync when selected inquiry changes
    useEffect(() => {
        if (selectedInquiryId) {
            const inq = inquiries.find(i => i.id === selectedInquiryId);
            setAdminNotes(inq?.adminNotes || '');
        }
    }, [selectedInquiryId, inquiries]);

    const handleSaveNotes = async (id: string) => {
        setSavingNotesId(id);
        try {
            await updateInquiryNotes(id, adminNotes);
            setToast({ message: 'Notas guardadas correctamente', type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al guardar notas', type: 'error' });
        } finally {
            setSavingNotesId(null);
        }
    };

    const handleStatusChange = async (id: string, newStatus: Inquiry['status']) => {
        try {
            await updateInquiryStatus(id, newStatus);
            setToast({ message: `Estado actualizado a "${STATUS_LABELS[newStatus]}"`, type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al actualizar estado', type: 'error' });
        }
    };

    const handleSeedData = async () => {
        setLoading(true);
        const seeded = await seedSampleInquiries();
        if (seeded) {
            setToast({ message: 'Datos de prueba creados con éxito', type: 'success' });
        } else {
            setToast({ message: 'La base de datos ya contiene solicitudes', type: 'error' });
        }
        setLoading(false);
    };

    // Clean and normalize phone numbers for WhatsApp
    const formatWhatsAppLink = (inq: Omit<Inquiry, 'id' | 'createdAt'>) => {
        const cleanPhone = inq.phone.replace(/\D/g, '');
        
        // Ensure Argentine format: if it starts with 15 (local mobile prefix), or doesn't have 54, handle it.
        // Let's assume the user enters country code. If not, we can default prepending 54.
        let phoneWithCountry = cleanPhone;
        if (cleanPhone.length > 0 && !cleanPhone.startsWith('54')) {
            if (cleanPhone.startsWith('9')) {
                phoneWithCountry = '54' + cleanPhone;
            } else if (cleanPhone.startsWith('15')) {
                // local mobile prefix in Argentina: strip 15, prepend 54 9 and area code (e.g. 11 for Buenos Aires, 3446 for Gualeguaychú/Urdinarrain)
                // Since Glak Apart is in Urdinarrain (area code 3446), local mobile might be 3446 15XXXXXX.
                // Let's just strip 15 and use 5493446 + rest or keep it simple.
                // Standard default: just prepend 54 if length is local
                phoneWithCountry = '54' + cleanPhone;
            } else {
                phoneWithCountry = '54' + cleanPhone;
            }
        }

        const greeting = `Hola ${inq.firstName}, me pongo en contacto desde Glak Apart respecto a tu consulta de disponibilidad del ${inq.checkIn} al ${inq.checkOut} para ${inq.adults} adulto${inq.adults > 1 ? 's' : ''}${inq.children > 0 ? ` y ${inq.children} niño${inq.children > 1 ? 's' : ''}` : ''}.`;
        const encodedText = encodeURIComponent(greeting);
        return `https://wa.me/${phoneWithCountry}?text=${encodedText}`;
    };

    // Grouping inquiries into unique guests
    const guestsList = React.useMemo(() => {
        const guestsMap: Record<string, Guest> = {};
        inquiries.forEach((inq) => {
            // Group primarily by phone (cleaned) or email
            const phoneKey = inq.phone.replace(/\D/g, '');
            const emailKey = inq.email.toLowerCase().trim();
            const key = phoneKey || emailKey || `${inq.firstName}-${inq.lastName}`.toLowerCase();
            
            if (!guestsMap[key]) {
                guestsMap[key] = {
                    fullName: `${inq.firstName} ${inq.lastName}`,
                    email: inq.email,
                    phone: inq.phone,
                    inquiries: []
                };
            }
            guestsMap[key].inquiries.push(inq);
        });
        
        // Sort inquiries inside guests (newest first)
        Object.values(guestsMap).forEach(g => {
            g.inquiries.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB.getTime() - dateA.getTime();
            });
        });

        // Convert to array and sort guests by their most recent inquiry date
        return Object.values(guestsMap).sort((a, b) => {
            const dateA = a.inquiries[0]?.createdAt?.toDate ? a.inquiries[0].createdAt.toDate() : new Date(a.inquiries[0]?.createdAt);
            const dateB = b.inquiries[0]?.createdAt?.toDate ? b.inquiries[0].createdAt.toDate() : new Date(b.inquiries[0]?.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
    }, [inquiries]);

    // Filters & Searches logic for Solicitudes tab
    const filteredInquiries = React.useMemo(() => {
        return inquiries.filter(inq => {
            const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
            const matchesSearch = 
                inq.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inq.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inq.phone.includes(searchQuery);
            return matchesStatus && matchesSearch;
        });
    }, [inquiries, statusFilter, searchQuery]);

    // Filters & Searches logic for Agenda tab
    const filteredGuests = React.useMemo(() => {
        if (!searchQuery) return guestsList;
        const queryLower = searchQuery.toLowerCase();
        return guestsList.filter(g => 
            g.fullName.toLowerCase().includes(queryLower) ||
            g.email.toLowerCase().includes(queryLower) ||
            g.phone.includes(queryLower)
        );
    }, [guestsList, searchQuery]);

    const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId);

    const handleViewHistoryLink = (guestPhone: string) => {
        setSearchQuery(guestPhone);
        setActiveSubTab('agenda');
        setExpandedGuestPhone(guestPhone);
    };

    if (loading && inquiries.length === 0) {
        return (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-sage border-t-forest rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-400 tracking-widest">CARGANDO HUÉSPEDES Y SOLICITUDES...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-2 gap-4">
                <div className="flex gap-6">
                    <button
                        onClick={() => { setActiveSubTab('solicitudes'); setSearchQuery(''); }}
                        className={`pb-3 text-sm font-bold tracking-widest uppercase border-b-2 transition-all relative ${
                            activeSubTab === 'solicitudes' 
                                ? 'border-[#10595a] text-[#10595a]' 
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Solicitudes
                        {inquiries.filter(i => i.status === 'new').length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                                {inquiries.filter(i => i.status === 'new').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('agenda'); setSearchQuery(''); }}
                        className={`pb-3 text-sm font-bold tracking-widest uppercase border-b-2 transition-all ${
                            activeSubTab === 'agenda' 
                                ? 'border-[#10595a] text-[#10595a]' 
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Agenda
                    </button>
                </div>

                {inquiries.length === 0 && (
                    <button
                        onClick={handleSeedData}
                        className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-3 py-2 rounded-lg transition-colors border border-gray-200"
                    >
                        <Database size={13} />
                        Cargar Solicitudes de Prueba
                    </button>
                )}
            </div>

            {/* TAB CONTENT: SOLICITUDES */}
            {activeSubTab === 'solicitudes' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Search, Filters & Inquiries List */}
                    <div className={`lg:col-span-2 space-y-4 ${selectedInquiryId ? 'hidden lg:block' : 'block'}`}>
                        {/* Filters Card */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            {/* Search bar */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, correo o teléfono..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-forest text-gray-700"
                                />
                            </div>

                            {/* State filters */}
                            <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                        statusFilter === 'all'
                                            ? 'bg-[#10595a] border-[#10595a] text-white shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    Todas ({inquiries.length})
                                </button>
                                {(Object.keys(STATUS_LABELS) as Array<Inquiry['status']>).map((status) => {
                                    const count = inquiries.filter(i => i.status === status).length;
                                    const isSelected = statusFilter === status;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-[#10595a] border-[#10595a] text-white shadow-sm'
                                                    : `${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text} ${STATUS_COLORS[status].border} hover:opacity-85`
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : STATUS_COLORS[status].iconBg}`} />
                                            {STATUS_LABELS[status]} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Inquiries list */}
                        <div className="space-y-3">
                            {filteredInquiries.map((inq) => {
                                const isSelected = selectedInquiryId === inq.id;
                                const colors = STATUS_COLORS[inq.status];
                                const dateStr = inq.createdAt?.toDate 
                                    ? inq.createdAt.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                                    : new Date(inq.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                                
                                return (
                                    <div
                                        key={inq.id}
                                        onClick={() => setSelectedInquiryId(inq.id)}
                                        className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#10595a]/30 ${
                                            isSelected ? 'border-[#10595a] ring-1 ring-[#10595a]/30 shadow-md' : 'border-gray-100'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                    {STATUS_LABELS[inq.status]}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">{dateStr}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-base leading-none">
                                                {inq.firstName} {inq.lastName}
                                            </h4>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><Calendar size={13} /> {inq.checkIn} al {inq.checkOut}</span>
                                                <span className="flex items-center gap-1"><Users size={13} /> {inq.adults} Ad. {inq.children > 0 && `· ${inq.children} Niñ.`}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                                            {inq.adminNotes && (
                                                <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400" title="Tiene notas administrativas">
                                                    <FileText size={14} />
                                                </div>
                                            )}
                                            <ChevronRight className={`text-gray-400 transition-transform ${isSelected ? 'translate-x-1 text-[#10595a]' : ''}`} size={16} />
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredInquiries.length === 0 && (
                                <div className="bg-white py-12 rounded-xl border border-gray-100 text-center shadow-sm">
                                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No se encontraron solicitudes con los filtros aplicados</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Detailed Inquiry View */}
                    <div className={`lg:col-span-1 ${selectedInquiryId ? 'block' : 'hidden lg:block'}`}>
                        {selectedInquiry ? (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                                {/* Detail Header */}
                                <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 text-xs tracking-wider uppercase">Detalle de Solicitud</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[selectedInquiry.status].bg} ${STATUS_COLORS[selectedInquiry.status].text} ${STATUS_COLORS[selectedInquiry.status].border}`}>
                                            {STATUS_LABELS[selectedInquiry.status]}
                                        </span>
                                        <button
                                            onClick={() => setSelectedInquiryId(null)}
                                            className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-150 transition-colors"
                                            aria-label="Cerrar detalle"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Detail Body */}
                                <div className="p-5 space-y-6">
                                    {/* Guest Card */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Huésped</h4>
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 border border-gray-100">
                                            <p className="font-bold text-gray-850 text-base leading-none">
                                                {selectedInquiry.firstName} {selectedInquiry.lastName}
                                            </p>
                                            <div className="space-y-1.5 text-sm text-gray-600">
                                                <a href={`tel:${selectedInquiry.phone}`} className="flex items-center gap-2 hover:text-forest transition-colors">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {selectedInquiry.phone}
                                                </a>
                                                <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 hover:text-forest transition-colors truncate">
                                                    <Mail size={14} className="text-gray-400" />
                                                    {selectedInquiry.email}
                                                </a>
                                            </div>
                                            <button
                                                onClick={() => handleViewHistoryLink(selectedInquiry.phone)}
                                                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-[#10595a] bg-[#10595a]/5 hover:bg-[#10595a]/10 px-3 py-2.5 rounded-xl transition-colors mt-2"
                                            >
                                                <ExternalLink size={13} />
                                                VER HISTORIAL EN AGENDA
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dates & Guest Counts */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1.5 flex items-center gap-1">
                                                <Calendar size={13} className="text-gray-400" />
                                                Check-In
                                            </h5>
                                            <div className="bg-gray-50 px-3 py-2.5 rounded-xl font-mono text-sm text-gray-800 font-bold border border-gray-100">
                                                {selectedInquiry.checkIn}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1.5 flex items-center gap-1">
                                                <Calendar size={13} className="text-gray-400" />
                                                Check-Out
                                            </h5>
                                            <div className="bg-gray-50 px-3 py-2.5 rounded-xl font-mono text-sm text-gray-800 font-bold border border-gray-100">
                                                {selectedInquiry.checkOut}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <h5 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1.5 flex items-center gap-1">
                                                <Users size={13} className="text-gray-400" />
                                                Huéspedes
                                            </h5>
                                            <div className="bg-gray-50 px-3 py-2.5 rounded-xl text-sm text-gray-800 font-semibold border border-gray-100">
                                                {selectedInquiry.adults} Adultos {selectedInquiry.children > 0 && `· ${selectedInquiry.children} Niños`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional message */}
                                    {selectedInquiry.message && (
                                        <div className="space-y-1.5">
                                            <h5 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Mensaje del Huésped</h5>
                                            <p className="bg-gray-50 p-3.5 rounded-xl text-sm text-gray-700 italic leading-relaxed border border-gray-100">
                                                "{selectedInquiry.message}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Status Switcher */}
                                    <div className="space-y-2">
                                        <h5 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Actualizar Estado</h5>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {(Object.keys(STATUS_LABELS) as Array<Inquiry['status']>).map((st) => (
                                                <button
                                                    key={st}
                                                    onClick={() => handleStatusChange(selectedInquiry.id, st)}
                                                    className={`px-2 py-2.5 rounded-xl text-sm font-semibold transition-colors border text-center ${
                                                        selectedInquiry.status === st
                                                            ? 'bg-[#10595a] text-white border-[#10595a] shadow-sm'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {STATUS_LABELS[st]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Admin Notes */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Notas Administrativas</h5>
                                            {savingNotesId === selectedInquiry.id && (
                                                <span className="text-[10px] text-[#10595a] animate-pulse">Guardando...</span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                rows={3}
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-forest resize-none"
                                                placeholder="Ej. Ya se le pasó presupuesto / Esperando seña..."
                                            />
                                            <button
                                                onClick={() => handleSaveNotes(selectedInquiry.id)}
                                                className="absolute right-2.5 bottom-2.5 bg-[#10595a] text-white p-2 rounded-lg hover:bg-[#0d4a4b] transition-all shadow-sm flex items-center justify-center"
                                                title="Guardar notas"
                                            >
                                                <Save size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* WhatsApp Direct contact button */}
                                    <a
                                        href={formatWhatsAppLink(selectedInquiry)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            // Auto transition status to 'contacted' if it was new/read
                                            if (selectedInquiry.status === 'new' || selectedInquiry.status === 'read') {
                                                handleStatusChange(selectedInquiry.id, 'contacted');
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-4 rounded-xl text-sm font-bold tracking-widest hover:bg-[#20ba5a] transition-all shadow-md hover:shadow-lg uppercase text-center"
                                    >
                                        <MessageCircle size={16} />
                                        Contactar por WhatsApp
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 sticky top-6">
                                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs">Selecciona una solicitud del listado para ver su detalle y gestionarla</p>
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* TAB CONTENT: AGENDA */}
            {activeSubTab === 'agenda' && (
                <div className="space-y-4">
                    {/* Search bar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar huésped por nombre, correo o teléfono..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-forest text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Guests Directory Accordion List */}
                    <div className="space-y-3">
                        {filteredGuests.map((guest) => {
                            const isExpanded = expandedGuestPhone === guest.phone;
                            const totalInquiries = guest.inquiries.length;
                            const latestInquiry = guest.inquiries[0];
                            const cleanPhone = guest.phone.replace(/\D/g, '');

                            return (
                                <div key={guest.phone || guest.email} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                                    {/* Guest Header summary row */}
                                    <div 
                                        onClick={() => setExpandedGuestPhone(isExpanded ? null : guest.phone)}
                                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-full bg-[#10595a]/10 text-[#10595a] flex items-center justify-center font-bold text-sm shrink-0">
                                                {guest.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-base leading-tight">{guest.fullName}</h4>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1"><Phone size={11} /> {guest.phone || 'Sin Teléfono'}</span>
                                                    <span className="flex items-center gap-1"><Mail size={11} /> {guest.email || 'Sin Email'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                            <span className="bg-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
                                                {totalInquiries} {totalInquiries === 1 ? 'Consulta' : 'Consultas'}
                                            </span>
                                            {cleanPhone && (
                                                <a 
                                                    href={formatWhatsAppLink(latestInquiry)}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()} // Stop accordion click
                                                    className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20ba5a] transition-all shadow-sm"
                                                    title="Chatear por WhatsApp"
                                                >
                                                    <MessageCircle size={15} />
                                                </a>
                                            )}
                                            {isExpanded ? (
                                                <ChevronDown className="text-gray-400" size={16} />
                                            ) : (
                                                <ChevronRight className="text-gray-400" size={16} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded History panel */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-gray-50 bg-gray-50/30">
                                            <h5 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4 pt-4">Historial de Consultas</h5>
                                            
                                            <div className="space-y-4">
                                                {guest.inquiries.map((inq, idx) => {
                                                    const colors = STATUS_COLORS[inq.status];
                                                    const dateStr = inq.createdAt?.toDate 
                                                        ? inq.createdAt.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : new Date(inq.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                                                    
                                                    return (
                                                        <div key={inq.id || idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
                                                            {/* Card Header info */}
                                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                                        {STATUS_LABELS[inq.status]}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 font-mono">{dateStr}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[11px] text-[#10595a] font-bold font-mono">
                                                                    {inq.checkIn} al {inq.checkOut}
                                                                </div>
                                                            </div>

                                                            {/* Guest count details */}
                                                            <div className="flex gap-4 text-xs text-gray-500 font-medium">
                                                                <span>Huéspedes: {inq.adults} Adultos {inq.children > 0 && `y ${inq.children} Niños`}</span>
                                                            </div>

                                                            {/* Message */}
                                                            {inq.message && (
                                                                <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                                                                    "{inq.message}"
                                                                </div>
                                                            )}

                                                            {/* Admin Notes inside History */}
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                                                                <div className="flex-1 text-xs text-gray-500">
                                                                    {inq.adminNotes ? (
                                                                        <span className="flex items-start gap-1">
                                                                            <FileText size={12} className="text-gray-400 mt-0.5 shrink-0" />
                                                                            <span><strong>Notas:</strong> {inq.adminNotes}</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">Sin notas de gestión.</span>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Fast status update dropdown in history */}
                                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">Estado:</span>
                                                                    <select
                                                                        value={inq.status}
                                                                        onChange={(e) => handleStatusChange(inq.id, e.target.value as Inquiry['status'])}
                                                                        className="text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-forest text-gray-700 font-bold"
                                                                    >
                                                                        {(Object.keys(STATUS_LABELS) as Array<Inquiry['status']>).map((st) => (
                                                                            <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {filteredGuests.length === 0 && (
                            <div className="bg-white py-12 rounded-xl border border-gray-100 text-center shadow-sm">
                                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No se encontraron huéspedes con los criterios de búsqueda</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
