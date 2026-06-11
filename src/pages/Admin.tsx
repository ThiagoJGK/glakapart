'use client';
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import AdminBranding from '@/components/admin/AdminBranding';
import AdminEvents from '@/components/admin/AdminEvents';
import AdminFAQ from '@/components/admin/AdminFAQ';
import AdminImages from '@/components/admin/AdminImages';
import AdminTexts from '@/components/admin/AdminTexts';
import AdminStats from '@/components/admin/AdminStats';
import AdminSEO from '@/components/admin/AdminSEO';
import { Logo } from '@/components/layout/Logo';
import { 
    LayoutDashboard, 
    Zap, 
    Image as ImageIcon, 
    FileText, 
    Calendar, 
    HelpCircle, 
    Settings, 
    Globe, 
    LogOut,
    Lock,
    Users
} from 'lucide-react';
import { AdminGuests } from '@/components/admin/AdminGuests';
import { subscribeToNewInquiriesCount } from '@/services/inquiries';

const ALLOWED_EMAILS = [
    'thiagojgk@gmail.com',
    'adrigglak@gmail.com',
    'apartglak@gmail.com',
];

const TAB_TITLES: Record<string, string> = {
    dashboard: 'Panel Principal',
    guests: 'Huéspedes y Solicitudes',
    'images-manager': 'Gestión de Imágenes',
    'texts-manager': 'Gestión de Textos',
    events: 'Eventos y Experiencias',
    faq: 'Preguntas Frecuentes',
    seo: 'SEO & Open Graph',
    settings: 'Configuración General',
};

const getUserFirstName = (email: string | null | undefined) => {
    if (!email) return 'Admin';
    return email.split('@')[0];
};

// â”€â”€â”€ Login Screen â”€â”€â”€
const AdminLogin: React.FC = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            setError('Error al iniciar sesión con Google');
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                    <div className="h-32 mb-8 flex items-center justify-center cursor-pointer" onClick={() => router.push('/')}>
                        <div style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(38%) saturate(600%) hue-rotate(130deg) brightness(85%)' }}>
                            <Logo className="w-auto h-32 max-w-[400px]" />
                        </div>
                    </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-3 px-4 rounded-lg text-sm font-bold text-gray-600 hover:border-forest hover:text-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {loading ? 'INGRESANDO...' : 'INGRESAR CON GOOGLE'}
                    </button>

                    <p className="text-[10px] text-gray-300 text-center tracking-widest">ACCESO RESTRINGIDO</p>
                </div>
            </div>
        </div>
    );
};

// ─── Admin Panel ───
const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [newInquiriesCount, setNewInquiriesCount] = useState(0);
    const { toggleDraftMode, authLoading, user } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (user && ALLOWED_EMAILS.includes(user.email?.toLowerCase() || '')) {
            const unsubscribe = subscribeToNewInquiriesCount((count) => {
                setNewInquiriesCount(count);
            });
            return () => unsubscribe();
        }
    }, [user]);

    if (authLoading) {
        return null;
    }

    // Show login if not authenticated or not in allowlist
    if (!user || !ALLOWED_EMAILS.includes(user.email?.toLowerCase() || '')) {
        return <AdminLogin />;
    }

    const handleQuickEdit = () => {
        toggleDraftMode(true);
        router.push('/');
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
    };

    const navButtonClass = (tab: string) =>
        `w-full flex items-center gap-3 px-5 py-2.5 text-xs font-semibold tracking-wider text-white/70 hover:text-white hover:bg-white/5 transition-all rounded-xl relative ${
            activeTab === tab 
                ? 'bg-white/10 text-white font-bold shadow-sm' 
                : ''
        }`;

    const NavButton: React.FC<{
        tab: string;
        icon: React.ReactNode;
        label: string;
        badge?: React.ReactNode;
    }> = ({ tab, icon, label, badge }) => (
        <button
            onClick={() => handleTabChange(tab)}
            className={navButtonClass(tab)}
        >
            {activeTab === tab && (
                <span className="absolute left-2.5 top-3 bottom-3 w-1 bg-sage rounded-full" />
            )}
            {icon}
            <span className="flex-1 text-left">{label}</span>
            {badge}
        </button>
    );

    const NavContent = () => (
        <>
            <NavButton
                tab="dashboard"
                icon={<LayoutDashboard size={14} className={activeTab === 'dashboard' ? 'text-sage' : 'text-white/40'} />}
                label="PANEL PRINCIPAL"
            />
            <NavButton
                tab="guests"
                icon={<Users size={14} className={activeTab === 'guests' ? 'text-sage' : 'text-white/40'} />}
                label="HUÉSPEDES"
                badge={newInquiriesCount > 0 && (
                    <span className="bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                        {newInquiriesCount}
                    </span>
                )}
            />
            <button
                onClick={() => { handleQuickEdit(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-semibold tracking-wider text-sage hover:bg-sage/10 transition-colors rounded-xl"
            >
                <Zap size={14} className="text-sage" />
                <span className="flex-1 text-left">EDICIÓN RÁPIDA</span>
            </button>

            <div className="h-px bg-white/5 my-2 mx-5" />

            <NavButton
                tab="images-manager"
                icon={<ImageIcon size={14} className={activeTab === 'images-manager' ? 'text-sage' : 'text-white/40'} />}
                label="GESTIÓN DE IMÁGENES"
            />
            <NavButton
                tab="texts-manager"
                icon={<FileText size={14} className={activeTab === 'texts-manager' ? 'text-sage' : 'text-white/40'} />}
                label="GESTIÓN DE TEXTOS"
            />

            <div className="h-px bg-white/5 my-2 mx-5" />

            <NavButton
                tab="events"
                icon={<Calendar size={14} className={activeTab === 'events' ? 'text-sage' : 'text-white/40'} />}
                label="EVENTOS & EXP"
            />
            <NavButton
                tab="faq"
                icon={<HelpCircle size={14} className={activeTab === 'faq' ? 'text-sage' : 'text-white/40'} />}
                label="PREGUNTAS FRECUENTES"
            />

            <div className="h-px bg-white/5 my-2 mx-5" />

            <NavButton
                tab="settings"
                icon={<Settings size={14} className={activeTab === 'settings' ? 'text-sage' : 'text-white/40'} />}
                label="AJUSTES GENERALES"
            />
            <NavButton
                tab="seo"
                icon={<Globe size={14} className={activeTab === 'seo' ? 'text-sage' : 'text-white/40'} />}
                label="SEO / OPEN GRAPH"
            />
        </>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* ─── Mobile Header ─── */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-forest text-white flex items-center justify-between px-5 py-3 shadow-lg">
                <div className="w-10 flex items-center justify-center opacity-50">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center h-[56px] cursor-pointer" onClick={() => router.push('/')}>
                    <Logo className="h-full w-auto brightness-0 invert max-w-[200px]" />
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Abrir menú"
                >
                    <span className={`block w-5 h-0.5 bg-white transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-5 h-0.5 bg-white transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-5 h-0.5 bg-white transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </header>

            {/* ─── Mobile Menu Overlay ─── */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[99] animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <nav className="absolute top-[56px] left-0 right-0 bg-forest text-white shadow-2xl overflow-y-auto max-h-[calc(100vh-56px)] p-3 space-y-1 animate-fade-in-up">
                        <NavContent />
                        <div className="h-px bg-white/10 my-4 mx-5"></div>
                        <div className="px-5 pb-2 truncate">
                            <p className="text-[9px] text-white/40 tracking-wider">SESIÓN ACTIVA</p>
                            <p className="text-xs font-medium text-white truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-semibold tracking-wider text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors rounded-xl"
                        >
                            <LogOut size={14} className="text-red-300/60" />
                            CERRAR SESIÓN
                        </button>
                        <div className="h-4"></div>
                    </nav>
                </div>
            )}

            <div className="flex bg-forest min-h-screen">
                {/* ─── Desktop Sidebar (hidden on mobile) ─── */}
                <aside className="hidden md:flex flex-col w-64 bg-forest text-white h-screen fixed left-0 top-0 border-r border-white/10">
                    {/* Header */}
                    <div className="p-5 flex flex-col items-center border-b border-white/10 flex-shrink-0">
                        <div className="h-14 w-full flex items-center justify-center cursor-pointer" onClick={() => router.push('/')}>
                            <Logo className="h-full w-auto max-w-[180px] brightness-0 invert" />
                        </div>
                    </div>
                    {/* Nav Items */}
                    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 no-scrollbar">
                        <NavContent />
                    </nav>
                    {/* Footer / User info */}
                    <div className="p-4 border-t border-white/10 bg-black/10 flex-shrink-0">
                        <div className="flex flex-col gap-2">
                            <div className="px-2 truncate">
                                <p className="text-[10px] text-white/50 tracking-wider">SESIÓN ACTIVA</p>
                                <p className="text-xs font-medium text-white truncate" title={user?.email || ''}>
                                    {user?.email}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold tracking-wider text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors rounded-xl"
                            >
                                <LogOut size={14} className="text-red-300/60" />
                                CERRAR SESIÓN
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ─── Main Content ─── */}
                <main className="w-full md:ml-64 h-screen overflow-y-auto no-scrollbar bg-white md:rounded-l-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.08)] p-5 pt-20 md:p-12 md:pt-12 relative z-10 border-l border-white/10">
                    <h2 className="text-2xl md:text-3xl text-forest font-light mb-8 md:mb-12 border-b border-gray-200 pb-4">
                        {TAB_TITLES[activeTab] || ''}
                    </h2>

                    {/* Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group col-span-1 md:col-span-2 lg:col-span-3">
                                <AdminStats />
                            </div>
                        </div>
                    )}

                    {activeTab === 'guests' && <AdminGuests />}
                    {activeTab === 'images-manager' && <AdminImages />}
                    {activeTab === 'texts-manager' && <AdminTexts />}
                    {activeTab === 'events' && <AdminEvents />}
                    {activeTab === 'faq' && <AdminFAQ />}
                    {activeTab === 'seo' && <AdminSEO />}
                    {activeTab === 'settings' && <AdminBranding />}
                </main>
            </div>
        </div>
    );
};

export default Admin;

