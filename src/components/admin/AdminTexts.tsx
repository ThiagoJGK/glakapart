'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { Toast } from '../ui/Toast';
import { apartmentData, ApartmentKey } from '@/data/apartments';
import { Save, Loader2, Sparkles, Navigation, Layers, Compass, BookOpen } from 'lucide-react';

const SUB_TABS = [
    { id: 'inicio', label: 'INICIO', icon: Sparkles },
    { id: 'apartamentos', label: 'APARTAMENTOS', icon: Compass },
    { id: 'gastronomia', label: 'GASTRONOMÍA', icon: BookOpen },
    { id: 'lugares', label: 'LUGARES & PLAYA', icon: Navigation },
];

const FALLBACK_TEXTS: Record<string, string> = {
    // Hero (stored in 'hero' section)
    'title': 'natural',
    'subtitle': 'URDINARRAIN',
    'description': 'Viví la experiencia Glak Apart entre paisaje y naturaleza. Alojamientos turísticos pensados para desconectar y disfrutar con los tuyos.',

    // General (stored in 'general' section)
    // Inicio
    'home.common.badge': 'ESPACIOS PARA COMPARTIR',
    'home.common.title': 'Rincones con Encanto',
    'home.common.desc': 'Más allá de tu apartamento, disfrutá de nuestras áreas comunes pensadas para el relax. Espacios verdes y recreativos para desconectar.',
    'home.common.feat1': 'Deck solarium',
    'home.common.feat2': 'Toallones de cortesía',
    'home.common.feat3': 'Agua cristalina',
    'home.common.feat4': 'Zona de descanso',
    'home.common.pool.title': 'Nuestra Piscina',
    'home.common.pool.text': 'Somos el único hospedaje en Urdinarrain que te ofrece una piscina exclusiva para que te refresques en verano. Rodeada de un parque espectacular, es el lugar perfecto para relajarte bajo el sol entrerriano.',
    'home.common.garden.title': 'Parque y Asadores',
    'home.common.garden.text': 'Contamos con un predio parquizado, reposeras, asadores y sector de parrillas al aire libre para que disfrutes de un asado entrerriano en familia o con amigos.',
    'home.common.garden.feat1': 'Parrillas equipadas',
    'home.common.garden.feat2': 'Mesas de jardín',
    'home.common.garden.feat3': 'Iluminación nocturna',
    'home.common.garden.feat4': 'Juegos para chicos',
    'home.guests.badge': 'OPINIONES',
    'home.guests.title': 'Qué dicen nuestros huéspedes',
    'home.guests.subtitle': 'Experiencias reales de quienes ya nos eligieron para su descanso.',
    'home.guests.btnText': 'VER RESEÑAS',
    'home.faq.badge': 'PREGUNTAS FRECUENTES',
    'home.faq.title': 'Resolvé tus dudas',
    'home.location.badge': 'UBICACIÓN',
    'home.location.title': 'Cómo llegar a Glak',
    'home.location.subtitle': 'Ubicados en un entorno tranquilo y accesible en la ciudad de Urdinarrain.',
    'home.location.address': 'Salta 435, Urdinarrain',
    'home.location.btnText': 'CÓMO LLEGAR',
    'home.instagram.badge': 'INSTAGRAM',
    'home.instagram.title': 'Seguinos en redes',
    'home.instagram.subtitle': '@glak.apart',
    'home.benefits.badge': 'BENEFICIOS',
    'home.benefits.title': '¿Por qué reservar aquí?',
    'home.benefits.desc': 'Descubrí las ventajas exclusivas de reservar tu estadía a través de nuestra página oficial. Garantizando siempre la mejor experiencia desde el primer clic.',
    'home.benefits.item1.title': 'Mejor Precio Garantizado',
    'home.benefits.item1.desc': 'Al reservar directamente en nuestra web, evitás comisiones de plataformas y accedés a la tarifa más baja disponible.',
    'home.benefits.item2.title': 'Late Check-Out Flex',
    'home.benefits.item2.desc': 'Disfrutá más tu último día con nosotros. Flexibilidad de late check-out (sujeto a disponibilidad y solicitud previa).',
    'home.benefits.item3.title': 'Atención Personalizada',
    'home.benefits.item3.desc': 'Contacto directo y una cálida hospitalidad brindada por sus propios dueños.',
    'home.explore.title1': 'Naturaleza',
    'home.explore.desc1': 'Explorá senderos y paisajes naturales.',
    'home.explore.title2': 'Gastronomía',
    'home.explore.desc2': 'Sabores locales e históricos.',
    'home.explore.title3': 'Historia',
    'home.explore.desc3': 'Museos y colonias alemanas.',

    // Gastronomia
    'gastronomia.hero.title': 'Sabores de Urdinarrain',
    'gastronomia.hero.subtitle': 'Gastronomía y Cocina Tradicional',
    'gastronomia.hero.description': 'Una identidad culinaria forjada entre la pampa criolla y la herencia de los alemanes del Volga. Un modelo de \'kilómetro cero\' donde la historia se saborea.',
    'gastronomia.ceferino.badge': 'HISTÓRICA',
    'gastronomia.ceferino.title': 'Panadería Ceferino',
    'gastronomia.ceferino.desc': 'Fundada hace décadas, sigue elaborando pan y facturas con horno a leña tradicional y recetas heredadas.',
    'gastronomia.ceferino.linkText': 'Ver ubicación',
    'gastronomia.pequena.badge': 'TRADICIÓN',
    'gastronomia.pequena.title': 'La Pequeña',
    'gastronomia.pequena.desc': 'Especialistas en chacinados tradicionales alemanes, quesos artesanales y productos de campo.',
    'gastronomia.pequena.feat1': 'Salames ahumados',
    'gastronomia.pequena.feat2': 'Chucrut casero',
    'gastronomia.pequena.feat3': 'Queso de campo',
    'gastronomia.pequena.feat4': 'Kreppel frescas',
    'gastronomia.finca.badge': 'VIÑEDO',
    'gastronomia.finca.title': 'Finca Los Bayos',
    'gastronomia.finca.desc': 'Viñedo boutique productor de vinos de alta gama en Entre Ríos, con visitas guiadas y degustaciones.',
    'gastronomia.finca.feat1': 'Malbec & Marselan',
    'gastronomia.finca.feat2': 'Chardonnay',
    'gastronomia.finca.feat3': 'Turismo enológico',
    'gastronomia.finca.feat4': 'Nuez pecán',
    'gastronomia.tendencias.title': 'Tendencias Gastronómicas',
    'gastronomia.tendencias.text1': 'Urdinarrain combina lo mejor de la herencia criolla con la alemana, creando una propuesta de sabores auténticos que atrae a visitantes de toda la región.',
    'gastronomia.tendencias.quote': '"La cocina de Urdinarrain es una carta de amor a nuestras raíces, donde cada ingrediente cuenta una historia de esfuerzo y tradición."',

    // Lugares & Playa
    'lugares.hero.badge': 'TURISMO LOCAL',
    'lugares.hero.title': 'Descubrí Urdinarrain',
    'lugares.hero.subtitle': 'Lugares de interés, naturaleza e historia en Entre Ríos.',
    'lugares.nature.badge': 'NATURALEZA',
    'lugares.nature.title': 'Selva en Galería',
    'lugares.nature.desc': 'Recorré senderos rodeados de flora y fauna autóctona a orillas del río.',
    'lugares.nature.linkText': 'Saber más',
    'lugares.sabores.badge': 'SABORES',
    'lugares.sabores.title': 'Circuitos de Campo',
    'lugares.sabores.desc': 'Degustá sabores regionales y visitá emprendimientos productivos locales.',
    'lugares.sabores.linkText': 'Ver circuitos',
    'lugares.adventure.badge': 'AVENTURA',
    'lugares.adventure.title': 'Actividades al Aire Libre',
    'lugares.adventure.desc': 'Vuelo a vela, senderismo, cicloturismo y avistaje en entornos únicos.',
    'lugares.adventure.linkText': 'Ver agenda',
    'lugares.adventure.plane.title': 'Vuelo a Vela',
    'lugares.adventure.plane.desc': 'Experimentá volar sin motor en planeadores biplazas.',
    'lugares.adventure.bike.title': 'Cicloturismo',
    'lugares.adventure.bike.desc': 'Caminos rurales ideales para recorrer en dos ruedas.',
    'lugares.adventure.camping.title': 'Campamento',
    'lugares.adventure.camping.desc': 'Zonas habilitadas para acampar bajo las estrellas.',
    'lugares.adventure.pesca.title': 'Pesca Deportiva',
    'lugares.adventure.pesca.desc': 'Excelentes pesqueros en arroyos y ríos cercanos.',
    'lugares.adventure.eco.title': 'Avistamiento',
    'lugares.adventure.eco.desc': 'Flora y fauna autóctona en estado natural.',
    'lugares.adventure.sunset.title': 'Atardeceres',
    'lugares.adventure.sunset.desc': 'Postales mágicas sobre el campo entrerriano.',
    'lugares.history.badge': 'HISTORIA',
    'lugares.history.title': 'Museo Regional',
    'lugares.history.desc': 'Ubicado en la vieja estación de tren, resguarda el patrimonio cultural y la historia local.',
    'lugares.history.linkText': 'Ver horarios',
    'lugares.history.quote': '"Urdinarrain guarda en sus calles y museos el latido de los inmigrantes que fundaron esta tierra con esperanza y trabajo."',
    'lugares.history.citation': 'Historiador Local',
    'lugares.museos.agricola': 'Museo Agrícola al aire libre con maquinaria histórica.',
    'lugares.museos.carruajes': 'Colección de carruajes antiguos restaurados.',

    // Arenas Blancas
    'arenasblancas.hero.badge': 'BALNEARIO MUNICIPAL',
    'arenasblancas.hero.title': 'Arenas Blancas',
    'arenasblancas.hero.subtitle': 'Tu refugio natural sobre el Río Gualeguay',
    'arenasblancas.hero.desc': 'Un paraíso de arenas finas y selva en galería a pocos minutos de Urdinarrain. Ideal para disfrutar del río, el camping y la tranquilidad en familia.',
    'arenasblancas.act.1.title': 'Playas',
    'arenasblancas.act.1.desc': 'Extensas playas de arena fina bañadas por el Río Gualeguay. Ideales para tomar sol y refrescarse.',
    'arenasblancas.act.2.title': 'Camping',
    'arenasblancas.act.2.desc': 'Zonas equipadas con parrillas, energía eléctrica, proveeduría y sanitarios completos para acampar.',
    'arenasblancas.act.3.title': 'Pesca',
    'arenasblancas.act.3.desc': 'Sectores específicos a orillas del río habilitados para la pesca deportiva en un entorno de paz.',
    'arenasblancas.act.4.title': 'Ecoturismo',
    'arenasblancas.act.4.desc': 'Senderos de interpretación a través de la densa selva en galería y avistaje de flora y fauna autóctona.',
    'arenasblancas.services.title': 'Información y Servicios',
    'arenasblancas.services.item1': 'Ubicación',
    'arenasblancas.services.item2': 'A 20 km de Urdinarrain por camino de ripio.',
    'arenasblancas.services.item3': 'Temporada',
    'arenasblancas.services.item4': 'Abierto todo el año, ideal de Diciembre a Marzo.',
    'arenasblancas.services.item5': 'Acceso',
    'arenasblancas.services.item6': 'Se abona una entrada accesible por vehículo/persona en temporada alta.',
    'arenasblancas.info.badge': 'INFORMACIÓN DE ACCESO',
    'arenasblancas.info.title': 'Consejos para tu visita',
    'arenasblancas.info.desc': 'Recomendamos ingresar con precaución los días de lluvia debido al camino de ripio. Contamos con guardavidas durante la temporada estival de 13 a 20 hs.',
    'arenasblancas.cta.title': '¿Listo para desconectar?',
    'arenasblancas.cta.desc': 'Te esperamos en Arenas Blancas para vivir momentos únicos rodeados de naturaleza. Glak Apart es tu punto de partida ideal.'
};

export const AdminTexts: React.FC = () => {
    const [activeTab, setActiveTab] = useState('inicio');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Form States
    const [heroData, setHeroData] = useState<Record<string, string>>({});
    const [generalData, setGeneralData] = useState<Record<string, string>>({});
    const [selectedApt, setSelectedApt] = useState<ApartmentKey>('nacarado');

    useEffect(() => {
        loadData();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [hero, general] = await Promise.all([
                getContent('hero'),
                getContent('general'),
            ]);

            setHeroData(hero || {});
            setGeneralData(general || {});
        } catch (error) {
            console.error('Error loading texts content:', error);
            showToast('Error al cargar los textos del sitio', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (section: 'hero' | 'general', key: string, value: string) => {
        if (section === 'hero') {
            setHeroData(prev => ({ ...prev, [key]: value }));
        } else {
            setGeneralData(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises: Promise<any>[] = [];

            // Save Hero keys (stored in 'hero' section)
            if (activeTab === 'inicio') {
                ['title', 'subtitle', 'description'].forEach(key => {
                    if (heroData[key] !== undefined) {
                        promises.push(updateContent('hero', key, heroData[key]));
                    }
                });
            }

            // Save general keys (stored in 'general' section)
            const keysToSave = getKeysForTab(activeTab);
            keysToSave.forEach(key => {
                if (generalData[key] !== undefined) {
                    promises.push(updateContent('general', key, generalData[key]));
                }
            });

            await Promise.all(promises);

            showToast('Textos guardados correctamente');
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error('Error saving texts:', error);
            showToast('Error al guardar los textos', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Helper to get which keys correspond to which tab
    const getKeysForTab = (tab: string): string[] => {
        switch (tab) {
            case 'inicio':
                return [
                    'home.common.badge', 'home.common.title', 'home.common.desc',
                    'home.common.feat1', 'home.common.feat2', 'home.common.feat3', 'home.common.feat4',
                    'home.common.pool.title', 'home.common.pool.text',
                    'home.common.garden.title', 'home.common.garden.text',
                    'home.common.garden.feat1', 'home.common.garden.feat2', 'home.common.garden.feat3', 'home.common.garden.feat4',
                    'home.guests.badge', 'home.guests.title', 'home.guests.subtitle', 'home.guests.btnText',
                    'home.faq.badge', 'home.faq.title',
                    'home.location.badge', 'home.location.title', 'home.location.subtitle', 'home.location.address', 'home.location.btnText',
                    'home.instagram.badge', 'home.instagram.title', 'home.instagram.subtitle',
                    'home.benefits.badge', 'home.benefits.title', 'home.benefits.desc',
                    'home.benefits.item1.title', 'home.benefits.item1.desc',
                    'home.benefits.item2.title', 'home.benefits.item2.desc',
                    'home.benefits.item3.title', 'home.benefits.item3.desc',
                    'home.explore.title1', 'home.explore.desc1',
                    'home.explore.title2', 'home.explore.desc2',
                    'home.explore.title3', 'home.explore.desc3'
                ];
            case 'apartamentos':
                const aptKeys: string[] = [];
                Object.keys(apartmentData).forEach(key => {
                    aptKeys.push(
                        `apartment.${key}.tagline`,
                        `apartment.${key}.name`,
                        `apartment.${key}.capacity`,
                        `apartment.${key}.description`
                    );
                    for (let i = 0; i < 6; i++) {
                        aptKeys.push(`apartment.${key}.feature.${i}`);
                    }
                });
                return aptKeys;
            case 'gastronomia':
                return [
                    'gastronomia.hero.title', 'gastronomia.hero.subtitle', 'gastronomia.hero.description',
                    'gastronomia.ceferino.badge', 'gastronomia.ceferino.title', 'gastronomia.ceferino.desc', 'gastronomia.ceferino.linkText',
                    'gastronomia.pequena.badge', 'gastronomia.pequena.title', 'gastronomia.pequena.desc',
                    'gastronomia.pequena.feat1', 'gastronomia.pequena.feat2', 'gastronomia.pequena.feat3', 'gastronomia.pequena.feat4',
                    'gastronomia.finca.badge', 'gastronomia.finca.title', 'gastronomia.finca.desc',
                    'gastronomia.finca.feat1', 'gastronomia.finca.feat2', 'gastronomia.finca.feat3', 'gastronomia.finca.feat4',
                    'gastronomia.tendencias.title', 'gastronomia.tendencias.text1', 'gastronomia.tendencias.quote'
                ];
            case 'lugares':
                return [
                    'lugares.hero.badge', 'lugares.hero.title', 'lugares.hero.subtitle',
                    'lugares.nature.badge', 'lugares.nature.title', 'lugares.nature.desc', 'lugares.nature.linkText',
                    'lugares.sabores.badge', 'lugares.sabores.title', 'lugares.sabores.desc', 'lugares.sabores.linkText',
                    'lugares.adventure.badge', 'lugares.adventure.title', 'lugares.adventure.desc', 'lugares.adventure.linkText',
                    'lugares.adventure.plane.title', 'lugares.adventure.plane.desc',
                    'lugares.adventure.bike.title', 'lugares.adventure.bike.desc',
                    'lugares.adventure.camping.title', 'lugares.adventure.camping.desc',
                    'lugares.adventure.pesca.title', 'lugares.adventure.pesca.desc',
                    'lugares.adventure.eco.title', 'lugares.adventure.eco.desc',
                    'lugares.adventure.sunset.title', 'lugares.adventure.sunset.desc',
                    'lugares.history.badge', 'lugares.history.title', 'lugares.history.desc', 'lugares.history.linkText',
                    'lugares.history.quote', 'lugares.history.citation',
                    'lugares.museos.agricola', 'lugares.museos.carruajes',
                    // Arenas Blancas
                    'arenasblancas.hero.badge', 'arenasblancas.hero.title', 'arenasblancas.hero.subtitle', 'arenasblancas.hero.desc',
                    'arenasblancas.act.1.title', 'arenasblancas.act.1.desc',
                    'arenasblancas.act.2.title', 'arenasblancas.act.2.desc',
                    'arenasblancas.act.3.title', 'arenasblancas.act.3.desc',
                    'arenasblancas.act.4.title', 'arenasblancas.act.4.desc',
                    'arenasblancas.services.title',
                    'arenasblancas.services.item1', 'arenasblancas.services.item2', 'arenasblancas.services.item3',
                    'arenasblancas.services.item4', 'arenasblancas.services.item5', 'arenasblancas.services.item6',
                    'arenasblancas.info.badge', 'arenasblancas.info.title', 'arenasblancas.info.desc',
                    'arenasblancas.cta.title', 'arenasblancas.cta.desc'
                ];
            default:
                return [];
        }
    };

    const getFallback = (section: 'hero' | 'general', key: string): string => {
        if (section === 'hero') {
            return FALLBACK_TEXTS[key] || '';
        }
        
        if (key.startsWith('apartment.')) {
            const parts = key.split('.');
            const aptKey = parts[1] as ApartmentKey;
            const field = parts[2];
            const apt = apartmentData[aptKey];
            if (apt) {
                if (field === 'name') return apt.name;
                if (field === 'tagline') return apt.tagline;
                if (field === 'capacity') return apt.capacity;
                if (field === 'description') return apt.description;
                if (field === 'feature') {
                    const idx = parseInt(parts[3], 10);
                    return apt.features[idx] || '';
                }
            }
        }
        
        return FALLBACK_TEXTS[key] || '';
    };

    const renderInput = (section: 'hero' | 'general', key: string, label: string, placeholder = '', isTextArea = false) => {
        const dbVal = section === 'hero' ? heroData[key] : generalData[key];
        const val = (dbVal !== undefined && dbVal !== null && dbVal !== '') ? dbVal : getFallback(section, key);

        return (
            <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                {isTextArea ? (
                    <textarea
                        value={val}
                        placeholder={placeholder}
                        onChange={(e) => handleTextChange(section, key, e.target.value)}
                        className="w-full border border-gray-200 focus:border-forest outline-none p-3 rounded-lg text-sm font-light text-gray-700 h-28 transition-colors resize-none bg-white"
                    />
                ) : (
                    <input
                        type="text"
                        value={val}
                        placeholder={placeholder}
                        onChange={(e) => handleTextChange(section, key, e.target.value)}
                        className="w-full border border-gray-200 focus:border-forest outline-none px-3 py-2 rounded-lg text-sm font-light text-gray-700 transition-colors bg-white"
                    />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <Loader2 className="w-10 h-10 text-sage animate-spin mb-4" />
                <p className="text-xs text-gray-400 tracking-widest uppercase">Cargando textos...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Sub-tab Navigation */}
            <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 scrollbar-hide shrink-0 snap-x">
                {SUB_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold tracking-widest transition-all snap-start shrink-0 ${isActive
                                ? 'bg-forest text-white shadow'
                                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Form Area */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                
                {/* --- TAB: INICIO --- */}
                {activeTab === 'inicio' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full border-b pb-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Sección Hero / Principal</h4>
                        </div>
                        {renderInput('hero', 'title', 'Título Inicial (Experiencia)', 'natural')}
                        {renderInput('hero', 'subtitle', 'Subtítulo Inicial (Urdinarrain)', 'URDINARRAIN')}
                        <div className="col-span-full">
                            {renderInput('hero', 'description', 'Descripción Principal', 'Viví la experiencia Glak Apart...', true)}
                        </div>

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Espacios Comunes (Resumen Inicio)</h4>
                        </div>
                        {renderInput('general', 'home.common.badge', 'Badge Sección')}
                        {renderInput('general', 'home.common.title', 'Título Sección')}
                        <div className="col-span-full">
                            {renderInput('general', 'home.common.desc', 'Descripción General', '', true)}
                        </div>
                        {renderInput('general', 'home.common.feat1', 'Característica Piscina 1')}
                        {renderInput('general', 'home.common.feat2', 'Característica Piscina 2')}
                        {renderInput('general', 'home.common.feat3', 'Característica Piscina 3')}
                        {renderInput('general', 'home.common.feat4', 'Característica Piscina 4')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Piscina & Parque (Detalles)</h4>
                        </div>
                        {renderInput('general', 'home.common.pool.title', 'Título Piscina')}
                        {renderInput('general', 'home.common.garden.title', 'Título Parque')}
                        <div className="col-span-full">
                            {renderInput('general', 'home.common.pool.text', 'Texto Piscina', '', true)}
                        </div>
                        <div className="col-span-full">
                            {renderInput('general', 'home.common.garden.text', 'Texto Parque', '', true)}
                        </div>
                        {renderInput('general', 'home.common.garden.feat1', 'Característica Parque 1')}
                        {renderInput('general', 'home.common.garden.feat2', 'Característica Parque 2')}
                        {renderInput('general', 'home.common.garden.feat3', 'Característica Parque 3')}
                        {renderInput('general', 'home.common.garden.feat4', 'Característica Parque 4')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Beneficios de Reserva Directa</h4>
                        </div>
                        {renderInput('general', 'home.benefits.badge', 'Badge Beneficios')}
                        {renderInput('general', 'home.benefits.title', 'Título Beneficios')}
                        <div className="col-span-full">
                            {renderInput('general', 'home.benefits.desc', 'Descripción Corta', '', true)}
                        </div>
                        {renderInput('general', 'home.benefits.item1.title', 'Beneficio 1: Título')}
                        {renderInput('general', 'home.benefits.item1.desc', 'Beneficio 1: Descripción')}
                        {renderInput('general', 'home.benefits.item2.title', 'Beneficio 2: Título')}
                        {renderInput('general', 'home.benefits.item2.desc', 'Beneficio 2: Descripción')}
                        {renderInput('general', 'home.benefits.item3.title', 'Beneficio 3: Título')}
                        {renderInput('general', 'home.benefits.item3.desc', 'Beneficio 3: Descripción')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Ubicación & FAQ (Secciones)</h4>
                        </div>
                        {renderInput('general', 'home.location.badge', 'Badge Ubicación')}
                        {renderInput('general', 'home.location.title', 'Título Ubicación')}
                        {renderInput('general', 'home.location.subtitle', 'Subtítulo Ubicación')}
                        {renderInput('general', 'home.location.address', 'Dirección Física')}
                        {renderInput('general', 'home.location.btnText', 'Botón Mapa')}
                        <div className="h-4 md:col-span-2"></div>
                        {renderInput('general', 'home.faq.badge', 'Badge FAQ')}
                        {renderInput('general', 'home.faq.title', 'Título FAQ')}
                    </div>
                )}

                {/* --- TAB: APARTAMENTOS --- */}
                {activeTab === 'apartamentos' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Ficha Técnica del Apartamento</h4>
                            {/* Selector interno */}
                            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-150 shrink-0 select-none">
                                {Object.keys(apartmentData).map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedApt(key as ApartmentKey)}
                                        className={`px-3 py-1.5 rounded-md text-[9px] font-bold tracking-widest uppercase transition-colors ${selectedApt === key
                                            ? 'bg-forest text-white'
                                            : 'text-gray-500 hover:text-forest hover:bg-gray-100'
                                            }`}
                                    >
                                        {apartmentData[key as ApartmentKey].name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderInput('general', `apartment.${selectedApt}.name`, 'Nombre del Apartamento')}
                            {renderInput('general', `apartment.${selectedApt}.tagline`, 'Lema / Tagline')}
                            {renderInput('general', `apartment.${selectedApt}.capacity`, 'Capacidad (Ej: 3-4 Pasajeros)')}
                            <div className="col-span-full">
                                {renderInput('general', `apartment.${selectedApt}.description`, 'Descripción General del Apartamento', '', true)}
                            </div>

                            <div className="col-span-full border-t pt-4 mt-2">
                                <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest block mb-4">Comodidades / Amenities (6 Campos)</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-full">
                                            {renderInput('general', `apartment.${selectedApt}.feature.${i}`, `Amenity ${i + 1}`)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: GASTRONOMIA --- */}
                {activeTab === 'gastronomia' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full border-b pb-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Gastronomía: Hero & Cabecera</h4>
                        </div>
                        {renderInput('general', 'gastronomia.hero.title', 'Título Principal')}
                        {renderInput('general', 'gastronomia.hero.subtitle', 'Subtítulo Principal')}
                        <div className="col-span-full">
                            {renderInput('general', 'gastronomia.hero.description', 'Descripción Cabecera', '', true)}
                        </div>

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Establecimiento: Ceferino</h4>
                        </div>
                        {renderInput('general', 'gastronomia.ceferino.badge', 'Insignia Ceferino')}
                        {renderInput('general', 'gastronomia.ceferino.title', 'Título Ceferino')}
                        <div className="col-span-full">
                            {renderInput('general', 'gastronomia.ceferino.desc', 'Descripción Ceferino', '', true)}
                        </div>
                        {renderInput('general', 'gastronomia.ceferino.linkText', 'Texto Enlace')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Establecimiento: La Pequeña</h4>
                        </div>
                        {renderInput('general', 'gastronomia.pequena.badge', 'Insignia La Pequeña')}
                        {renderInput('general', 'gastronomia.pequena.title', 'Título La Pequeña')}
                        <div className="col-span-full">
                            {renderInput('general', 'gastronomia.pequena.desc', 'Descripción La Pequeña', '', true)}
                        </div>
                        {renderInput('general', 'gastronomia.pequena.feat1', 'Item 1')}
                        {renderInput('general', 'gastronomia.pequena.feat2', 'Item 2')}
                        {renderInput('general', 'gastronomia.pequena.feat3', 'Item 3')}
                        {renderInput('general', 'gastronomia.pequena.feat4', 'Item 4')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Establecimiento: Finca Los Bayos</h4>
                        </div>
                        {renderInput('general', 'gastronomia.finca.badge', 'Insignia Finca')}
                        {renderInput('general', 'gastronomia.finca.title', 'Título Finca')}
                        <div className="col-span-full">
                            {renderInput('general', 'gastronomia.finca.desc', 'Descripción Finca', '', true)}
                        </div>
                        {renderInput('general', 'gastronomia.finca.feat1', 'Item 1')}
                        {renderInput('general', 'gastronomia.finca.feat2', 'Item 2')}
                        {renderInput('general', 'gastronomia.finca.feat3', 'Item 3')}
                        {renderInput('general', 'gastronomia.finca.feat4', 'Item 4')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Comentarios y Citas de Tendencias</h4>
                        </div>
                        {renderInput('general', 'gastronomia.tendencias.title', 'Título Tendencias')}
                        <div className="col-span-full">
                            {renderInput('general', 'gastronomia.tendencias.text1', 'Texto Párrafo Principal', '', true)}
                        </div>
                        <div className="col-span-full">
                            {renderInput('general', 'gastronomia.tendencias.quote', 'Cita Testimonial', '', true)}
                        </div>
                    </div>
                )}

                {/* --- TAB: LUGARES & PLAYA --- */}
                {activeTab === 'lugares' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full border-b pb-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Lugares: Hero / Cabecera</h4>
                        </div>
                        {renderInput('general', 'lugares.hero.badge', 'Badge Cabecera')}
                        {renderInput('general', 'lugares.hero.title', 'Título Principal')}
                        <div className="col-span-full">
                            {renderInput('general', 'lugares.hero.subtitle', 'Descripción Cabecera', '', true)}
                        </div>

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Puntos de Interés</h4>
                        </div>
                        {renderInput('general', 'lugares.nature.title', 'Naturaleza: Título')}
                        {renderInput('general', 'lugares.nature.desc', 'Naturaleza: Descripción', '', true)}
                        {renderInput('general', 'lugares.sabores.title', 'Sabores: Título')}
                        {renderInput('general', 'lugares.sabores.desc', 'Sabores: Descripción', '', true)}
                        {renderInput('general', 'lugares.adventure.title', 'Aventura: Título')}
                        {renderInput('general', 'lugares.adventure.desc', 'Aventura: Descripción', '', true)}
                        {renderInput('general', 'lugares.history.title', 'Historia: Título')}
                        {renderInput('general', 'lugares.history.desc', 'Historia: Descripción', '', true)}
                        <div className="col-span-full">
                            {renderInput('general', 'lugares.history.quote', 'Cita Histórica', '', true)}
                        </div>
                        {renderInput('general', 'lugares.history.citation', 'Citación Autor')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Aventura (Detalles por Tipo)</h4>
                        </div>
                        {renderInput('general', 'lugares.adventure.plane.title', 'Planeador: Título')}
                        {renderInput('general', 'lugares.adventure.plane.desc', 'Planeador: Descripción')}
                        {renderInput('general', 'lugares.adventure.bike.title', 'Ciclismo: Título')}
                        {renderInput('general', 'lugares.adventure.bike.desc', 'Ciclismo: Descripción')}

                        <div className="col-span-full border-b pb-4 pt-4 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Museos locales</h4>
                        </div>
                        {renderInput('general', 'lugares.museos.agricola', 'Museo Agrícola')}
                        {renderInput('general', 'lugares.museos.carruajes', 'Museo Carruajes')}

                        {/* ARENAS BLANCAS SECTION */}
                        <div className="col-span-full border-b pb-4 pt-6 mb-2">
                            <h4 className="font-bold text-forest text-sm tracking-wide uppercase">Balneario Arenas Blancas (Playa)</h4>
                        </div>
                        {renderInput('general', 'arenasblancas.hero.badge', 'Badge Cabecera')}
                        {renderInput('general', 'arenasblancas.hero.title', 'Título Cabecera')}
                        {renderInput('general', 'arenasblancas.hero.subtitle', 'Subtítulo Cabecera')}
                        <div className="col-span-full">
                            {renderInput('general', 'arenasblancas.hero.desc', 'Descripción General Balneario', '', true)}
                        </div>

                        <div className="col-span-full pt-2">
                            <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest block mb-4">Actividades en la Playa (4 Tarjetas)</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border p-4 rounded-xl space-y-4">
                                    {renderInput('general', 'arenasblancas.act.1.title', 'Actividad 1: Título')}
                                    {renderInput('general', 'arenasblancas.act.1.desc', 'Actividad 1: Descripción', '', true)}
                                </div>
                                <div className="border p-4 rounded-xl space-y-4">
                                    {renderInput('general', 'arenasblancas.act.2.title', 'Actividad 2: Título')}
                                    {renderInput('general', 'arenasblancas.act.2.desc', 'Actividad 2: Descripción', '', true)}
                                </div>
                                <div className="border p-4 rounded-xl space-y-4">
                                    {renderInput('general', 'arenasblancas.act.3.title', 'Actividad 3: Título')}
                                    {renderInput('general', 'arenasblancas.act.3.desc', 'Actividad 3: Descripción', '', true)}
                                </div>
                                <div className="border p-4 rounded-xl space-y-4">
                                    {renderInput('general', 'arenasblancas.act.4.title', 'Actividad 4: Título')}
                                    {renderInput('general', 'arenasblancas.act.4.desc', 'Actividad 4: Descripción', '', true)}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-full pt-4">
                            <span className="font-bold text-[10px] text-gray-400 uppercase tracking-widest block mb-4">Servicios Generales & Call to Action</span>
                        </div>
                        {renderInput('general', 'arenasblancas.services.title', 'Título Servicios')}
                        <div className="h-4 md:col-span-2"></div>
                        {renderInput('general', 'arenasblancas.info.badge', 'Info Box: Badge')}
                        {renderInput('general', 'arenasblancas.info.title', 'Info Box: Título')}
                        <div className="col-span-full">
                            {renderInput('general', 'arenasblancas.info.desc', 'Info Box: Descripción', '', true)}
                        </div>
                        {renderInput('general', 'arenasblancas.cta.title', 'CTA: Título')}
                        <div className="h-4 md:col-span-2"></div>
                        <div className="col-span-full">
                            {renderInput('general', 'arenasblancas.cta.desc', 'CTA: Descripción', '', true)}
                        </div>
                    </div>
                )}

                {/* Submit Action */}
                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 bg-[#10595a] text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-forest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-wait"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        {saving ? 'GUARDANDO TEXTOS...' : 'GUARDAR TEXTOS'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTexts;
