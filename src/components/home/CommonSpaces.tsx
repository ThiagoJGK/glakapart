import React from 'react';
import Editable from '../ui/Editable';

const CommonSpaces: React.FC = () => {
    return (
        <section className="py-32 relative bg-gray-50/50">
            {/* Decorative background blob */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-sage/10 rounded-full filter blur-3xl -z-0 translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center mb-24 max-w-2xl mx-auto">
                    <Editable id="home.common.badge" defaultValue="ESPACIOS PARA COMPARTIR" className="font-ui text-[10px] md:text-xs tracking-[0.3em] font-bold block mb-6 uppercase bg-[#10595a] text-white px-4 py-2 rounded-full w-fit mx-auto" label="Badge" />
                    <Editable id="home.common.title" defaultValue="Rincones con Encanto" className="font-script text-6xl md:text-7xl text-forest block mb-8" label="Título Principal" />
                    <Editable
                        id="home.common.desc"
                        type="textarea"
                        defaultValue="Más allá de tu apartamento, disfrutá de nuestras áreas comunes pensadas para el relax. Espacios verdes y recreativos para desconectar."
                        className="text-gray-600 font-light text-xl leading-relaxed block"
                        label="Descripción"
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Pool Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
                        <div className="h-[350px] w-full mb-8 transform group-hover:rotate-1 transition-transform duration-500 relative">
                            <div className="absolute inset-0 border-[8px] border-white shadow-lg rounded-sm overflow-hidden z-10">
                                <Editable
                                    id="home.common.pool.image"
                                    type="image"
                                    defaultValue=""
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    label="Foto Piscina"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-ui text-xs font-bold text-sage tracking-widest mb-2">RELAX & SOL</h3>
                                    <Editable id="home.common.pool.title" defaultValue="Piscina y Solarium" className="font-script text-4xl text-forest block" label="Título Piscina" />
                                </div>
                                <span className="text-3xl">🏊‍♂️</span>
                            </div>
                            <Editable
                                id="home.common.pool.text"
                                type="textarea"
                                defaultValue="Sumergite en nuestra piscina rodeada de verde o disfrutá del sol en nuestras reposeras. El lugar perfecto para las tardes de verano."
                                className="text-gray-600 leading-7 block text-base"
                                label="Texto Piscina"
                            />
                            <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-500 pt-4 border-t border-gray-100">
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat1" defaultValue="Deck de madera" className="inline" label="Feature 1" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat2" defaultValue="Toallones incluidos" className="inline" label="Feature 2" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat3" defaultValue="Mantenimiento diario" className="inline" label="Feature 3" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat4" defaultValue="Zona de sombra" className="inline" label="Feature 4" /></li>
                            </ul>
                        </div>
                    </div>

                    {/* Garden Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
                        <div className="h-[350px] w-full mb-8 transform group-hover:-rotate-1 transition-transform duration-500 relative">
                            <div className="absolute inset-0 border-[8px] border-white shadow-lg rounded-sm overflow-hidden z-10">
                                <Editable
                                    id="home.common.garden.image"
                                    type="image"
                                    defaultValue=""
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    label="Foto Parque"
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-ui text-xs font-bold text-sage tracking-widest mb-2">AIRE LIBRE</h3>
                                    <Editable id="home.common.garden.title" defaultValue="Parque y Asadores" className="font-script text-4xl text-forest block" label="Título Parque" />
                                </div>
                                <span className="text-3xl">🌳</span>
                            </div>
                            <Editable
                                id="home.common.garden.text"
                                type="textarea"
                                defaultValue="Nuestro extenso parque invita a matear bajo los árboles. Contamos con asadores disponibles para que no falte el tradicional asado en tu estadía."
                                className="text-gray-600 leading-7 block text-base"
                                label="Texto Parque"
                            />
                            <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-500 pt-4 border-t border-gray-100">
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat1" defaultValue="Parrillas equipadas" className="inline" label="Feature 1" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat2" defaultValue="Mesas de jardín" className="inline" label="Feature 2" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat3" defaultValue="Iluminación nocturna" className="inline" label="Feature 3" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat4" defaultValue="Juegos para chicos" className="inline" label="Feature 4" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CommonSpaces;






