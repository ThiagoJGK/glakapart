import React from 'react';
import Editable from '@/components/ui/Editable';
import Link from 'next/link';

const ArenasBlancas: React.FC = () => {
    return (
        <main className="relative z-30 pt-48 md:pt-64 pb-32 animate-fade-in group/main overflow-x-clip">
            <h1 className="sr-only">Balneario Arenas Blancas en Urdinarrain - Naturaleza y Playa</h1>
            
            <div className="fixed inset-0 -z-20 w-full h-full bg-[#f4f1ea]">
                <Editable
                    id="arenasblancas.background"
                    type="image"
                    defaultValue="https://www.transparenttextures.com/patterns/cubes.png"
                    className="w-full h-full object-cover opacity-5"
                />
            </div>

            <div className="container mx-auto px-6 max-w-6xl">
                {/* Hero / Header */}
                <div className="text-center mb-16 md:mb-24">
                    <Link href="/lugares" className="inline-flex items-center gap-2 text-forest/70 hover:text-forest font-bold text-sm tracking-widest uppercase mb-8 transition-colors">
                        <span>←</span> Volver a Lugares
                    </Link>
                    <div className="relative inline-block mb-6">
                        <Editable
                            id="arenasblancas.hero.badge"
                            defaultValue="BALNEARIO MUNICIPAL"
                            className="font-ui font-bold text-xs tracking-[0.3em] uppercase bg-[#10595a] text-white px-4 py-2 rounded-full mb-4 inline-block mx-auto"
                            label="Badge"
                        />
                    </div>
                    <Editable
                        id="arenasblancas.title"
                        defaultValue="Arenas Blancas"
                        className="font-script text-7xl md:text-9xl text-forest block drop-shadow-sm mb-8"
                        label="Título Principal"
                    />
                    <Editable
                        id="arenasblancas.intro"
                        type="textarea"
                        defaultValue="A tan solo 20 kilómetros de la ciudad, sobre el Río Gualeguay, se esconde este paraíso natural. 400 metros de playas de arena blanca y más de 16 hectáreas de monte nativo te esperan para desconectar."
                        className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light block"
                        label="Introducción"
                    />
                </div>

                {/* Main Feature Image */}
                <div className="relative h-[400px] md:h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white mb-24 group">
                    <Editable
                        id="arenasblancas.mainImage"
                        type="image"
                        defaultValue=""
                        className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
                        label="Imagen Principal"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Actividades Grid */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <Editable
                            id="arenasblancas.actividades.title"
                            defaultValue="¿QUÉ HACER EN ARENAS BLANCAS?"
                            className="font-ui font-black text-2xl md:text-4xl text-forest block mb-4"
                            label="Título Actividades"
                        />
                        <div className="w-16 h-1 bg-sage mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Actividad 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform origin-left">🏖️</div>
                            <Editable id="arenasblancas.act.1.title" defaultValue="Playas" className="font-bold text-xl text-forest mb-3 block" label="Título Act 1" />
                            <Editable id="arenasblancas.act.1.desc" type="textarea" defaultValue="Extensas playas de arena fina bañadas por el Río Gualeguay. Ideales para tomar sol y refrescarse." className="text-gray-600 text-sm leading-relaxed block" label="Desc Act 1" />
                        </div>
                        {/* Actividad 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform origin-left">⛺</div>
                            <Editable id="arenasblancas.act.2.title" defaultValue="Camping" className="font-bold text-xl text-forest mb-3 block" label="Título Act 2" />
                            <Editable id="arenasblancas.act.2.desc" type="textarea" defaultValue="Zonas equipadas con parrillas, energía eléctrica, proveeduría y sanitarios completos para acampar." className="text-gray-600 text-sm leading-relaxed block" label="Desc Act 2" />
                        </div>
                        {/* Actividad 3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform origin-left">🎣</div>
                            <Editable id="arenasblancas.act.3.title" defaultValue="Pesca" className="font-bold text-xl text-forest mb-3 block" label="Título Act 3" />
                            <Editable id="arenasblancas.act.3.desc" type="textarea" defaultValue="Sectores específicos a orillas del río habilitados para la pesca deportiva en un entorno de paz." className="text-gray-600 text-sm leading-relaxed block" label="Desc Act 3" />
                        </div>
                        {/* Actividad 4 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                            <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform origin-left">🌿</div>
                            <Editable id="arenasblancas.act.4.title" defaultValue="Ecoturismo" className="font-bold text-xl text-forest mb-3 block" label="Título Act 4" />
                            <Editable id="arenasblancas.act.4.desc" type="textarea" defaultValue="Senderos de interpretación a través de la densa selva en galería y avistaje de flora y fauna autóctona." className="text-gray-600 text-sm leading-relaxed block" label="Desc Act 4" />
                        </div>
                    </div>
                </div>

                {/* Información Útil */}
                <div className="bg-forest rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden mb-24">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <Editable
                                id="arenasblancas.info.title"
                                defaultValue="Información Útil"
                                className="font-script text-5xl md:text-6xl mb-8 block drop-shadow-md"
                                label="Título Info"
                            />
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl mt-1">📍</span>
                                    <div>
                                        <h4 className="font-bold mb-1">Ubicación</h4>
                                        <p className="text-white/80 text-sm">A 20 km de Urdinarrain por camino de ripio.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl mt-1">🗓️</span>
                                    <div>
                                        <h4 className="font-bold mb-1">Temporada</h4>
                                        <p className="text-white/80 text-sm">Abierto todo el año, ideal de Diciembre a Marzo.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl mt-1">🚗</span>
                                    <div>
                                        <h4 className="font-bold mb-1">Acceso</h4>
                                        <p className="text-white/80 text-sm">Se abona una entrada accesible por vehículo/persona en temporada alta.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Pequeña galería o foto secundaria */}
                        <div className="grid grid-cols-2 gap-4">
                            <Editable
                                id="arenasblancas.info.image1"
                                type="image"
                                defaultValue=""
                                className="rounded-2xl h-48 w-full object-cover shadow-lg"
                                label="Foto Info 1"
                            />
                            <Editable
                                id="arenasblancas.info.image2"
                                type="image"
                                defaultValue=""
                                className="rounded-2xl h-48 w-full object-cover shadow-lg mt-8"
                                label="Foto Info 2"
                            />
                        </div>
                    </div>
                </div>

                {/* CTA - Reserva en Glak Apart */}
                <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8d5b5]/20 rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-sage/10 rounded-tr-full"></div>
                    
                    <Editable
                        id="arenasblancas.cta.title"
                        defaultValue="Tu descanso soñado te espera"
                        className="font-script text-5xl md:text-6xl text-forest mb-6 block relative z-10"
                        label="Título CTA"
                    />
                    <Editable
                        id="arenasblancas.cta.desc"
                        type="textarea"
                        defaultValue="Disfrutá del día en el balneario Arenas Blancas y regresá a la comodidad, el confort y la piscina de Glak Apart para coronar un día perfecto en Entre Ríos."
                        className="text-gray-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed block relative z-10"
                        label="Desc CTA"
                    />
                    <Link href="/" className="inline-block relative z-10 bg-forest text-white px-10 py-4 rounded-full font-bold tracking-widest uppercase text-sm hover:bg-sage transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Reservá tu Estadía
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default ArenasBlancas;
