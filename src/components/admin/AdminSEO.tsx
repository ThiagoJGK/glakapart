'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { Toast } from '../ui/Toast';
import { Globe, Save, Image as ImageIcon, ExternalLink } from 'lucide-react';

const PAGES = [
    { id: 'home', label: 'INICIO', url: '/' },
    { id: 'gastronomia', label: 'GASTRONOMÍA', url: '/gastronomia' },
    { id: 'lugares', label: 'LUGARES', url: '/lugares' },
    { id: 'eventos', label: 'EVENTOS', url: '/eventos' },
];

const DEFAULT_SEO: Record<string, { title: string; description: string }> = {
    home: {
        title: 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos',
        description: 'Viví la experiencia Glak Apart entre paisaje y naturaleza. Alojamientos turísticos pensados para desconectar.',
    },
    gastronomia: {
        title: 'Gastronomía en Urdinarrain | Glak Apart',
        description: 'Descubrí la mejor gastronomía regional de Urdinarrain y Entre Ríos.',
    },
    lugares: {
        title: 'Lugares para Visitar | Glak Apart',
        description: 'Explorá los mejores atractivos turísticos cerca de Urdinarrain.',
    },
    eventos: {
        title: 'Eventos en Urdinarrain | Glak Apart',
        description: 'Conocé los próximos eventos y actividades en Urdinarrain.',
    },
};

const AdminSEO: React.FC = () => {
    const [activePage, setActivePage] = useState('home');
    const [seoData, setSeoData] = useState<Record<string, { title: string; description: string; image: string }>>({
        home: { title: '', description: '', image: '' },
        gastronomia: { title: '', description: '', image: '' },
        lugares: { title: '', description: '', image: '' },
        eventos: { title: '', description: '', image: '' },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadSEO();
    }, []);

    const loadSEO = async () => {
        setLoading(true);
        try {
            const data = await getContent('seo');
            if (data) {
                const loaded: any = {};
                PAGES.forEach(({ id }) => {
                    loaded[id] = {
                        title: data[`${id}.title`] || DEFAULT_SEO[id]?.title || '',
                        description: data[`${id}.description`] || DEFAULT_SEO[id]?.description || '',
                        image: data[`${id}.image`] || '',
                    };
                });
                setSeoData(loaded);
            }
        } catch (err) {
            console.error('Error loading SEO data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = PAGES.flatMap(({ id }) => [
                updateContent('seo', `${id}.title`, seoData[id]?.title || ''),
                updateContent('seo', `${id}.description`, seoData[id]?.description || ''),
                updateContent('seo', `${id}.image`, seoData[id]?.image || ''),
            ]);
            await Promise.all(updates);
            setToast({ message: 'Datos SEO guardados con éxito', type: 'success' });
        } catch (err) {
            setToast({ message: 'Error al guardar datos SEO', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const url = await uploadImage(e.target.files[0], () => {});
            setSeoData(prev => ({
                ...prev,
                [activePage]: { ...prev[activePage], image: url },
            }));
            setToast({ message: 'Imagen subida correctamente', type: 'success' });
        } catch {
            setToast({ message: 'Error al subir la imagen', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const updateField = (field: 'title' | 'description', value: string) => {
        setSeoData(prev => ({
            ...prev,
            [activePage]: { ...prev[activePage], [field]: value },
        }));
    };

    const current = seoData[activePage] || { title: '', description: '', image: '' };
    const currentPage = PAGES.find(p => p.id === activePage);

    return (
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-5xl relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {uploading && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-sage border-t-forest rounded-full animate-spin mb-4"></div>
                    <p className="text-xs text-forest font-bold tracking-widest animate-pulse">SUBIENDO IMAGEN...</p>
                </div>
            )}

            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-forest" />
                    <h3 className="font-ui tracking-widest text-lg text-forest">SEO / OPEN GRAPH</h3>
                </div>
                <p className="text-sm text-gray-500">
                    Editá el título, descripción e imagen que aparecen cuando alguien comparte un link de tu sitio en WhatsApp, redes sociales o buscadores.
                </p>
            </div>

            {/* Page Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-gray-100 mb-8">
                {PAGES.map(page => (
                    <button
                        key={page.id}
                        onClick={() => setActivePage(page.id)}
                        className={`px-5 py-2.5 text-xs font-bold tracking-widest transition-all border-b-2 ${activePage === page.id
                            ? 'border-forest text-forest bg-forest/5'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {page.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-sage border-t-forest rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Editor */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                                Título de la Página
                            </label>
                            <input
                                type="text"
                                value={current.title}
                                onChange={e => updateField('title', e.target.value)}
                                placeholder={DEFAULT_SEO[activePage]?.title || 'Título de la página...'}
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-forest"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">{current.title.length}/60 caracteres recomendados</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                                Descripción
                            </label>
                            <textarea
                                value={current.description}
                                onChange={e => updateField('description', e.target.value)}
                                placeholder={DEFAULT_SEO[activePage]?.description || 'Descripción corta...'}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-forest resize-none"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">{current.description.length}/160 caracteres recomendados</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                                Imagen al Compartir (Open Graph)
                            </label>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                                <p className="text-xs text-blue-600 font-medium flex items-center gap-2">
                                    <ImageIcon size={12} />
                                    Tamaño recomendado: <strong>1200 × 630 px</strong> — JPG o PNG, máx. 1MB
                                </p>
                                <p className="text-[10px] text-blue-400 mt-1">Esta imagen aparece cuando alguien comparte el link en WhatsApp, Instagram, Facebook, etc.</p>
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-forest hover:bg-gray-50 transition-colors shadow-sm">
                                <ImageIcon size={14} />
                                {current.image ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                            {current.image && (
                                <p className="text-[10px] text-green-600 mt-2 font-medium">✓ Imagen cargada</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Preview Card */}
                    <div>
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Preview al Compartir</p>
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                            {/* Image Area */}
                            <div className="h-40 bg-gray-100 relative overflow-hidden">
                                {current.image ? (
                                    <img src={current.image} alt="OG Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300 flex-col gap-2">
                                        <ImageIcon size={28} />
                                        <p className="text-[10px] tracking-widest uppercase">Sin imagen (1200×630px)</p>
                                    </div>
                                )}
                            </div>
                            {/* Text Area */}
                            <div className="p-4 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">glakapart.com.ar{currentPage?.url}</p>
                                <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-1">
                                    {current.title || DEFAULT_SEO[activePage]?.title || 'Título de la página'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">
                                    {current.description || DEFAULT_SEO[activePage]?.description || 'Descripción de la página...'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                            <ExternalLink size={11} />
                            <span>Así se ve en WhatsApp, Facebook, Twitter y Google</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-8 border-t border-gray-100 mt-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-forest text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest hover:bg-forest/90 transition-all shadow-md disabled:opacity-50"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    GUARDAR CAMBIOS SEO
                </button>
            </div>
        </div>
    );
};

export default AdminSEO;
