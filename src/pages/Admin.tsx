'use client';
import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { getContent, updateContent } from '@/services/content';
import AdminBranding from '@/components/admin/AdminBranding';
import AdminEvents from '@/components/admin/AdminEvents';
import AdminFAQ from '@/components/admin/AdminFAQ';
import AdminHome from '@/components/admin/AdminHome';
import AdminStats from '@/components/admin/AdminStats';
import AdminApartments from '@/components/admin/AdminApartments';
import AdminSeasons from '@/components/admin/AdminSeasons';
import AdminChatbot from '@/components/admin/AdminChatbot';

const ALLOWED_EMAILS = [
    'thiagojgk@gmail.com',
    'adrigglak@gmail.com',
    'apartglak@gmail.com',
];

const TAB_TITLES: Record<string, string> = {
    dashboard: 'Bienvenido, Admin',
    home: 'Página de Inicio',
    events: 'Gestión de Eventos',
    seasons: 'Fotos de Estaciones',
    apartments: 'Galería de Apartamentos',
    faq: 'Preguntas Frecuentes',
    chatbot: 'Asistente Inteligente',
    settings: 'Configuración General',
};

// â”€â”€â”€ Login Screen â”€â”€â”€
const AdminLogin: React.FC = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                <div className="text-center mb-10">
                    <h1 className="font-script text-5xl text-forest mb-2">Glak Admin</h1>
                    <p className="text-[10px] text-gray-400 tracking-[0.3em] uppercase">Panel de Control</p>
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

// â”€â”€â”€ Admin Panel â”€â”€â”€
const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { toggleDraftMode, authLoading, user } = useAdmin();
    const router = useRouter();
    const [sampleMode, setSampleMode] = useState(false);

    React.useEffect(() => {
        if (user) {
            getContent('settings').then(data => {
                if (data) setSampleMode(data.sampleMode || false);
            });
        }
    }, [user]);

    const handleToggleSampleMode = async () => {
        const newValue = !sampleMode;
        setSampleMode(newValue);
        await updateContent('settings', 'sampleMode', newValue);
        window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
    };

    // Show loading spinner while Firebase checks auth state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-script text-4xl text-forest mb-4 animate-pulse">Glak Admin</h1>
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
        `w-full text-left px-8 py-4 text-xs tracking-widest hover:bg-white/5 transition-colors ${activeTab === tab ? 'bg-white/10 border-r-4 border-sage' : ''}`;

    const NavContent = () => (
        <>
            <button onClick={() => handleTabChange('dashboard')} className={navButtonClass('dashboard')}>
                DASHBOARD
            </button>
            <button
                onClick={() => { handleQuickEdit(); setMobileMenuOpen(false); }}
                className="w-full text-left px-8 py-4 text-xs tracking-widest hover:bg-sage/20 transition-colors text-sage font-bold"
            >
                ⚡ EDICIÓN RÁPIDA
            </button>

            <div className="h-px bg-white/10 mx-8 my-4"></div>

            <button onClick={() => handleTabChange('home')} className={navButtonClass('home')}>
                INICIO
            </button>
            <button onClick={() => handleTabChange('apartments')} className={navButtonClass('apartments')}>
                GALERÍA
            </button>
            <button onClick={() => handleTabChange('events')} className={navButtonClass('events')}>
                EVENTOS
            </button>
            <button onClick={() => handleTabChange('seasons')} className={navButtonClass('seasons')}>
                ESTACIONES
            </button>
            <button onClick={() => handleTabChange('faq')} className={navButtonClass('faq')}>
                FAQ
            </button>
            <button onClick={() => handleTabChange('chatbot')} className={navButtonClass('chatbot')}>
                IA CHATBOT
            </button>

            <div className="h-px bg-white/10 mx-8 my-4"></div>

            <button onClick={() => handleTabChange('settings')} className={navButtonClass('settings')}>
                CONFIGURACIÓN
            </button>

            <div className="h-px bg-white/10 mx-8 my-4"></div>

            {/* User info + logout */}
            <div className="px-8 py-3">
                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
            <button
                onClick={handleLogout}
                className="w-full text-left px-8 py-4 text-xs tracking-widest hover:bg-red-500/20 transition-colors text-red-300"
            >
                CERRAR SESIÓN
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* â”€â”€â”€ Mobile Header â”€â”€â”€ */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-forest text-white flex items-center justify-between px-5 py-3 shadow-lg">
                <div>
                    <h1 className="font-script text-2xl leading-none">Glak Admin</h1>
                    <p className="text-[8px] opacity-50 tracking-widest">PANEL DE CONTROL</p>
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

            {/* â”€â”€â”€ Mobile Menu Overlay â”€â”€â”€ */}
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
                {/* â”€â”€â”€ Desktop Sidebar (hidden on mobile) â”€â”€â”€ */}
                <aside className="hidden md:block w-64 bg-forest text-white h-screen fixed left-0 top-0 overflow-y-auto">
                    <div className="p-8">
                        <h1 className="font-script text-4xl mb-2">Glak Admin</h1>
                        <p className="text-[10px] opacity-50 tracking-widest">PANEL DE CONTROL</p>
                    </div>
                    <nav className="mt-8">
                        <NavContent />
                    </nav>
                </aside>

                {/* â”€â”€â”€ Main Content â”€â”€â”€ */}
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

                            <div
                                onClick={handleToggleSampleMode}
                                className={`p-6 md:p-8 rounded-xl shadow-sm border transition-all cursor-pointer group flex flex-col items-start ${sampleMode ? 'bg-[#10595a] text-white border-[#10595a]' : 'bg-white text-gray-800 border-gray-100 hover:shadow-xl hover:-translate-y-1'}`}
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 md:mb-6 transition-colors ${sampleMode ? 'bg-white/20 text-white' : 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white'}`}>
                                    <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className={`font-ui text-base md:text-lg tracking-widest mb-2 ${sampleMode ? 'text-white' : ''}`}>Modo Muestra</h3>
                                <p className={`text-sm leading-relaxed ${sampleMode ? 'text-white/80' : 'text-gray-500'}`}>
                                    {sampleMode ? 'Activado. Llenando vacíos con imágenes falsas.' : 'Desactivado. Clic para usar imágenes falsas en huecos vacíos.'}
                                </p>
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
                    {activeTab === 'chatbot' && <AdminChatbot />}
                    {activeTab === 'settings' && <AdminBranding />}
                </main>
            </div>
        </div>
    );
};

export default Admin;

