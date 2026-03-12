'use client';
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import AdminBranding from '@/components/admin/AdminBranding';
import AdminEvents from '@/components/admin/AdminEvents';
import AdminFAQ from '@/components/admin/AdminFAQ';
import AdminHome from '@/components/admin/AdminHome';
import AdminStats from '@/components/admin/AdminStats';
import AdminApartments from '@/components/admin/AdminApartments';
import AdminSeasons from '@/components/admin/AdminSeasons';
import AdminSEO from '@/components/admin/AdminSEO';
import { Logo } from '@/components/layout/Logo';

const ALLOWED_EMAILS = [
    'thiagojgk@gmail.com',
    'adrigglak@gmail.com',
    'apartglak@gmail.com',
];

const TAB_TITLES: Record<string, string> = {
    dashboard: 'Panel Principal',
    home: 'Página de Inicio',
    events: 'Gestión de Eventos',
    seasons: 'Fotos de Estaciones',
    apartments: 'Galería de Apartamentos',
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
                        <Logo className="w-auto h-full max-w-[400px]" />
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
    const { toggleDraftMode, authLoading, user } = useAdmin();
    const router = useRouter();

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center flex flex-col items-center">
                    <div className="h-32 mb-10 flex items-center justify-center animate-pulse opacity-50 cursor-pointer" onClick={() => router.push('/')}>
                        <Logo className="w-auto h-full max-w-[400px]" />
                    </div>
                    <p className="text-xs text-gray-400 tracking-widest">CARGANDO...</p>
                </div>
            </div>
        );
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
        `w-full text-left px-8 py-3 text-xs tracking-widest hover:bg-white/5 transition-colors ${activeTab === tab ? 'bg-white/10 border-r-4 border-sage' : ''}`;

    const NavContent = () => (
        <>
            <div className="px-8 py-2 mt-4 mb-1">
                <p className="text-[10px] font-bold text-sage/70 tracking-widest uppercase">Vista General</p>
            </div>
            <button onClick={() => handleTabChange('dashboard')} className={navButtonClass('dashboard')}>
                PANEL PRINCIPAL
            </button>
            <button
                onClick={() => { handleQuickEdit(); setMobileMenuOpen(false); }}
                className="w-full text-left px-8 py-3 text-xs tracking-widest hover:bg-sage/20 transition-colors text-sage font-bold flex items-center gap-2"
            >
                <span>⚡</span> EDICIÓN RÁPIDA
            </button>

            <div className="px-8 py-2 mt-6 mb-1">
                <p className="text-[10px] font-bold text-sage/70 tracking-widest uppercase">Catálogos Visuales</p>
            </div>
            <button onClick={() => handleTabChange('apartments')} className={navButtonClass('apartments')}>
                APARTAMENTOS
            </button>
            <button onClick={() => handleTabChange('events')} className={navButtonClass('events')}>
                EVENTOS
            </button>
            <button onClick={() => handleTabChange('seasons')} className={navButtonClass('seasons')}>
                ESTACIONES
            </button>

            <div className="px-8 py-2 mt-6 mb-1">
                <p className="text-[10px] font-bold text-sage/70 tracking-widest uppercase">Textos de Pantalla</p>
            </div>
            <button onClick={() => handleTabChange('home')} className={navButtonClass('home')}>
                INICIO
            </button>
            <button onClick={() => handleTabChange('faq')} className={navButtonClass('faq')}>
                PREGUNTAS FRECUENTES
            </button>

            <div className="px-8 py-2 mt-6 mb-1">
                <p className="text-[10px] font-bold text-sage/70 tracking-widest uppercase">Ajustes del Sitio</p>
            </div>
            <button onClick={() => handleTabChange('seo')} className={navButtonClass('seo')}>
                SEO / OPEN GRAPH
            </button>
            <button onClick={() => handleTabChange('settings')} className={navButtonClass('settings')}>
                CONFIGURACIÓN
            </button>

            <div className="h-px bg-white/10 mx-8 my-6"></div>

            {/* User info + logout */}
            <div className="px-8 pb-2">
                <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
            </div>
            <button
                onClick={handleLogout}
                className="w-full text-left px-8 py-3 text-xs tracking-widest hover:bg-red-500/20 transition-colors text-red-300"
            >
                CERRAR SESIÓN
            </button>
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
                    <nav className="absolute top-[56px] left-0 right-0 bg-forest text-white shadow-2xl overflow-y-auto max-h-[calc(100vh-56px)] animate-fade-in-up">
                        <NavContent />
                        <div className="h-4"></div>
                    </nav>
                </div>
            )}

            <div className="flex">
                {/* ─── Desktop Sidebar (hidden on mobile) ─── */}
                <aside className="hidden md:block w-64 bg-forest text-white h-screen fixed left-0 top-0 overflow-y-auto">
                    <div className="p-8 flex flex-col items-center border-b border-white/10">
                        <div className="h-32 w-full flex items-center justify-center mb-6 cursor-pointer" onClick={() => router.push('/')}>
                            <Logo className="h-full w-auto max-w-[240px] brightness-0 invert" />
                        </div>
                        <p className="text-[10px] opacity-70 tracking-widest">PANEL DE CONTROL</p>
                    </div>
                    <nav className="mt-4 pb-8">
                        <NavContent />
                    </nav>
                </aside>

                {/* ─── Main Content ─── */}
                <main className="w-full md:ml-64 p-5 pt-20 md:p-12 md:pt-12">
                    <h2 className="text-2xl md:text-3xl text-forest font-light mb-8 md:mb-12 border-b border-gray-200 pb-4">
                        {TAB_TITLES[activeTab] || ''}
                    </h2>

                    {/* Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <div
                                onClick={handleQuickEdit}
                                className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-sage/10 text-sage rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:bg-sage group-hover:text-white transition-colors">
                                    <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                                <h3 className="font-ui text-base md:text-lg tracking-widest mb-2">Edición Visual</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">Edita el contenido del sitio web navegando como un usuario real.</p>
                            </div>

                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group col-span-1 lg:col-span-3">
                                <AdminStats />
                            </div>
                        </div>
                    )}

                    {activeTab === 'home' && <AdminHome />}
                    {activeTab === 'apartments' && <AdminApartments />}
                    {activeTab === 'events' && <AdminEvents />}
                    {activeTab === 'seasons' && <AdminSeasons />}
                    {activeTab === 'faq' && <AdminFAQ />}
                    {activeTab === 'seo' && <AdminSEO />}
                    {activeTab === 'settings' && <AdminBranding />}
                </main>
            </div>
        </div>
    );
};

export default Admin;

