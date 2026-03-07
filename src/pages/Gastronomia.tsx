import React from 'react';
import Editable from '@/components/ui/Editable';
import ScrollReveal from '@/components/ui/ScrollReveal';

const Gastronomia: React.FC = () => {
    return (
        <main className="relative z-30 pt-64 md:pt-[480px] pb-32 animate-fade-in group/main">
            {/* Fixed Editable Background */}
            <div className="fixed inset-0 -z-20 w-full h-full">
                <Editable
                    id="gastronomia.background"
                    type="image"
                    defaultValue="https://www.transparenttextures.com/patterns/cubes.png"
                    className="w-full h-full object-cover opacity-5"
                    label="Fondo de Pagina"
                />
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-6 mb-24 text-center">
                {/* Mobile: H2 first (overlapping header), then Span. Desktop: Span then H2 (default flow) */}
                <div className="flex flex-col md:block relative z-30">
                    <Editable
                        id="gastronomia.hero.title"
                        defaultValue="Ruta de Sabores"
                        className="order-1 md:order-none font-script text-7xl md:text-9xl text-forest drop-shadow-sm relative z-30 mb-2 md:mb-12 -mt-16 md:mt-0 block"
                        label="Título Principal"
                    />
                    <Editable
                        id="gastronomia.hero.badge"
                        defaultValue="De la Tierra a la Mesa"
                        className="order-2 md:order-none font-ui text-[10px] md:text-xs font-bold tracking-[0.3em] bg-[#10595a] text-white px-4 py-2 rounded-full uppercase mb-12 md:mb-6 block w-fit"
                        label="Insignia Principal"
                    />
                </div>

                {/* Hero Image in Frame */}
                <div className="relative h-[450px] w-full max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white transform hover:rotate-1 transition-transform duration-500 mb-20 group mt-4 md:mt-0">
                    <Editable
                        id="gastronomia.heroImage"
                        type="image"
                        defaultValue="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1920"
                        className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
                        label="Imagen Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-0 w-full text-center px-4">
                        <p className="text-white/90 text-lg font-light max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                            "Una identidad culinaria forjada entre la pampa criolla y la herencia de los alemanes del Volga. Un modelo de 'kilómetro cero' donde la historia se saborea."
                        </p>
                    </div>
                </div>

                {/* HISTORICAL CONTEXT */}
                <ScrollReveal>
                    <div className="max-w-4xl mx-auto text-center mb-32 space-y-8">
                        <h3 className="text-5xl md:text-6xl font-script text-forest">Génesis Histórica</h3>
                        <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
                            <Editable
                                id="gastronomia.history"
                                type="textarea"
                                defaultValue="La identidad gastronómica de Urdinarrain es indisoluble de su origen ferroviario y la colonización agrícola. La llegada de los alemanes del Volga trajo técnicas de conservación y panificación que hoy son patrimonio intangible. Una cocina que evolucionó de la subsistencia a la abundancia, caracterizada por el uso de crema de leche, masas fermentadas y embutidos ahumados."
                                className="block"
                                label="Texto Historia"
                            />
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            <div className="container mx-auto px-6 md:px-12 space-y-40">

                {/* 1. PANADERÍA CEFERINO (Patrimonio Vivo) */}
                <section id="ceferino" className="scroll-mt-32">
                    <div className="flex items-end gap-6 mb-12 border-b border-sage/20 pb-6">
                        {/* Number removed */}
                        <Editable
                            id="gastronomia.section1.title"
                            defaultValue="EL ALMA DEL PAN"
                            className="text-4xl md:text-5xl font-ui font-black text-forest relative z-10 block"
                            label="Título Sección 1"
                        />
                    </div>

                    <div className="bg-[#f8f5f0] rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-lg border border-[#e8d5b5]">
                        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="space-y-8">
                                <Editable id="gastronomia.ceferino.badge" defaultValue="50 AÑOS DE TRADICIÓN" className="font-ui text-xs font-bold tracking-widest text-white bg-forest px-4 py-2 rounded-full inline-block" label="Badge" />
                                <Editable id="gastronomia.ceferino.title" defaultValue="Panadería Ceferino" className="text-5xl md:text-6xl font-script text-forest block" label="Título" />
                                <Editable
                                    id="gastronomia.ceferino.desc"
                                    type="textarea"
                                    defaultValue="Fundada por la familia Magnin, este lugar es un museo vivo. Su horno a leña centenario es el secreto detrás de sus tortitas negras, galletas de miel y el legendario Pan Dulce artesanal. Una resistencia cultural frente a la industrialización."
                                    className="text-gray-700 text-lg leading-relaxed block"
                                    label="Descripción"
                                />
                                <div className="space-y-4 pt-4 border-t border-sage/20">
                                    <div className="flex gap-4 items-start">
                                        <span className="text-2xl mt-1">🪵</span>
                                        <div>
                                            <h5 className="font-bold text-forest text-sm">HORNO A LEÑA</h5>
                                            <p className="text-xs text-gray-600">Alimentado con espinillo o ñandubay para un aroma único.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <span className="text-2xl mt-1">🍯</span>
                                        <div>
                                            <h5 className="font-bold text-forest text-sm">ESPECIALIDADES</h5>
                                            <p className="text-xs text-gray-600">Ochenta Golpes, Galletitas de Miel y Pan Dulce.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative aspect-video lg:h-[500px] h-auto w-full rounded-[2rem] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                                <Editable
                                    id="gastronomia.ceferino.image"
                                    type="image"
                                    defaultValue="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover"
                                    label="Foto Ceferino"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. LA PEQUEÑA & LOS BAYOS (Productores) */}
                <section id="productores">
                    <div className="flex items-end gap-6 mb-12 border-b border-sage/20 pb-6 justify-end text-right">
                        <h3 className="text-3xl md:text-5xl font-ui font-black text-forest relative z-10 break-words">PRODUCTORES PREMIADOS</h3>
                        {/* Number removed */}
                    </div>

                    <div className="space-y-24">
                        {/* La Pequeña */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-12 group hover:shadow-2xl transition-all">
                            <div className="md:w-5/12 aspect-video lg:h-[350px] h-auto relative overflow-hidden rounded-2xl">
                                <Editable
                                    id="gastronomia.pequena.image"
                                    type="image"
                                    defaultValue="https://images.unsplash.com/photo-1627341872134-2e21b7145749?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <Editable
                                        id="gastronomia.pequena.badge"
                                        defaultValue="MEDALLA DE ORO 2024"
                                        className="bg-[#d4af37] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest shadow-md inline-block"
                                        label="Insignia La Pequeña"
                                    />
                                </div>
                            </div>
                            <div className="md:w-7/12 space-y-6">
                                <Editable
                                    id="gastronomia.pequena.title"
                                    defaultValue='Lácteos "La Pequeña"'
                                    className="text-5xl md:text-6xl font-script text-forest block"
                                    label="Título La Pequeña"
                                />
                                <Editable
                                    id="gastronomia.pequena.desc"
                                    type="textarea"
                                    defaultValue="Excelencia láctea y sostenibilidad. Su <strong>dulce de leche</strong> ha sido galardonado como el mejor del país. El establecimiento integra un modelo de economía circular, utilizando suero lácteo para alimentar un criadero de cerdos y proteger el ambiente."
                                    className="text-gray-600 leading-relaxed block"
                                    label="Descripción La Pequeña"
                                />
                                <ul className="grid grid-cols-2 gap-4 text-sm text-gray-700 font-medium">
                                    <li className="flex items-center gap-2"><span className="text-sage">✓</span> <Editable id="gastronomia.pequena.feat1" defaultValue="Dulce de Leche Repostero" className="inline" label="Item 1" /></li>
                                    <li className="flex items-center gap-2"><span className="text-sage">✓</span> <Editable id="gastronomia.pequena.feat2" defaultValue="Quesos Tybo y Holanda" className="inline" label="Item 2" /></li>
                                    <li className="flex items-center gap-2"><span className="text-sage">✓</span> <Editable id="gastronomia.pequena.feat3" defaultValue="Yogurt Artesanal Premium" className="inline" label="Item 3" /></li>
                                    <li className="flex items-center gap-2"><span className="text-sage">✓</span> <Editable id="gastronomia.pequena.feat4" defaultValue="Visitas Guiadas" className="inline" label="Item 4" /></li>
                                </ul>
                            </div>
                        </div>

                        {/* Finca Los Bayos */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row-reverse gap-12 group hover:shadow-2xl transition-all">
                            <div className="md:w-5/12 aspect-video lg:h-[350px] h-auto relative overflow-hidden rounded-2xl">
                                <Editable
                                    id="gastronomia.finca.image"
                                    type="image"
                                    defaultValue="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="md:w-7/12 space-y-6 text-right md:text-left">
                                <div className="flex flex-col md:items-end">
                                    <Editable
                                        id="gastronomia.finca.title"
                                        defaultValue="Finca Los Bayos"
                                        className="text-5xl md:text-6xl font-script text-forest block"
                                        label="Título Finca"
                                    />
                                    <Editable
                                        id="gastronomia.finca.badge"
                                        defaultValue="EL RENACER DEL VINO ENTRERRIANO"
                                        className="text-xs font-bold text-sage tracking-widest uppercase mt-1 block"
                                        label="Insignia Finca"
                                    />
                                </div>
                                <Editable
                                    id="gastronomia.finca.desc"
                                    type="textarea"
                                    defaultValue="Una bodega artesanal en un entorno de 14 hectáreas. Cepas adaptadas al terruño local producen Merlot, Chardonnay y el vibrante Marselan. La experiencia se completa con espumantes método Champenoise y plantaciones de nuez pecán."
                                    className="text-gray-600 leading-relaxed md:text-right block"
                                    label="Descripción Finca"
                                />
                                <div className="flex justify-end gap-3 flex-wrap">
                                    <span className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-forest border border-gray-100">MARSELAN</span>
                                    <span className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-forest border border-gray-100">CHARDONNAY</span>
                                    <span className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-forest border border-gray-100">ESPUMANTES</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. HERENCIA ALEMANA (Volga Traditions) */}
                <section id="herencia" className="scroll-mt-32">
                    <div className="flex items-end gap-6 mb-12 border-b border-sage/20 pb-6">
                        {/* Number removed */}
                        <Editable
                            id="gastronomia.section3.title"
                            defaultValue="MESA DE LOS ALEMANES"
                            className="text-4xl md:text-5xl font-ui font-black text-forest relative z-10 block"
                            label="Título Sección 3"
                        />
                    </div>

                    <div className="bg-forest text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-sage/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 text-center mb-12">
                            <Editable
                                id="gastronomia.herencia.intro"
                                type="textarea"
                                defaultValue='"Platos nacidos de la adaptación. La cocina de los alemanes del Volga es un ejemplo de aprovechamiento y sabor, preservada oralmente en familias como los Wagner y Riehme."'
                                className="max-w-3xl mx-auto text-lg leading-relaxed text-white/90 block"
                                label="Intro Herencia Alemana"
                            />
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 relative z-10">

                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                <h4 className="font-bold text-[#e8d5b5] mb-2 font-ui tracking-widest text-sm">SNITSUP</h4>
                                <p className="text-xs text-white/80 leading-5">Sopa dulce de orejones y crema. Tradición de Semana Santa.</p>
                            </div>
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                <h4 className="font-bold text-[#e8d5b5] mb-2 font-ui tracking-widest text-sm">KREPPEL</h4>
                                <p className="text-xs text-white/80 leading-5">La torta frita alemana, infaltable en las meriendas de campo.</p>
                            </div>
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                <h4 className="font-bold text-[#e8d5b5] mb-2 font-ui tracking-widest text-sm">CHUCRUT</h4>
                                <p className="text-xs text-white/80 leading-5">Col fermentada, acompañamiento ideal para carnes y embutidos de cerdo.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. GUÍA URBANA (Restó & Pizzerias) */}
                <section id="guia" className="scroll-mt-32">
                    <div className="text-center mb-16">
                        <Editable
                            id="gastronomia.section4.badge"
                            defaultValue="DÓNDE COMER"
                            className="font-ui text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-4 block"
                            label="Insignia Guía"
                        />
                        <Editable
                            id="gastronomia.section4.title"
                            defaultValue="Guía Gastronómica"
                            className="text-5xl font-script text-forest block"
                            label="Título Guía"
                        />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Paradores & Restaurantes */}
                        <div className="space-y-8">
                            <h4 className="flex items-center gap-3 font-bold text-forest text-xl border-b border-gray-200 pb-2">
                                <span>🍽️</span> Paradores y Bodegones
                            </h4>
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div>
                                        <h5 className="font-bold text-forest">El Parador Centro</h5>
                                        <p className="text-xs text-gray-400 font-bold tracking-widest mb-2">AV. LIBERTAD 555</p>
                                        <p className="text-sm text-gray-600">Alta calificación (9.2/10). Platos abundantes y cocina regional auténtica.</p>
                                    </div>
                                    <a href="tel:344615560343" className="text-sage text-xl opacity-50 hover:opacity-100">📞</a>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div>
                                        <h5 className="font-bold text-forest">Oporto Birrería</h5>
                                        <p className="text-xs text-gray-400 font-bold tracking-widest mb-2">PATRIARCA 413</p>
                                        <p className="text-sm text-gray-600">Cerveza artesanal, tapeo contemporáneo y finger food. Ambiente joven.</p>
                                    </div>
                                    <a href="tel:3446353971" className="text-sage text-xl opacity-50 hover:opacity-100">📞</a>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div>
                                        <h5 className="font-bold text-forest">La Tapera</h5>
                                        <p className="text-xs text-gray-400 font-bold tracking-widest mb-2">PERÓN Y 3 DE FEBRERO</p>
                                        <p className="text-sm text-gray-600">Bodegón rústico con cocina casera.</p>
                                    </div>
                                    <a href="tel:344615618663" className="text-sage text-xl opacity-50 hover:opacity-100">📞</a>
                                </div>
                                {/* Condensed List */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h6 className="font-bold text-sm text-forest">El Quincho</h6>
                                        <p className="text-[10px] text-gray-500">Parrilla Tradicional</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h6 className="font-bold text-sm text-forest">Acuario Pub</h6>
                                        <p className="text-[10px] text-gray-500">Resto-bar & Coctelería</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pizzerias & Rotiserias */}
                        <div className="space-y-8">
                            <h4 className="flex items-center gap-3 font-bold text-forest text-xl border-b border-gray-200 pb-2">
                                <span>🍕</span> Pizzerías y Al Paso
                            </h4>
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div>
                                        <h5 className="font-bold text-forest">Pizzería Piamonte</h5>
                                        <p className="text-xs text-gray-400 font-bold tracking-widest mb-2">3 DE FEBRERO Y PERÓN</p>
                                        <p className="text-sm text-gray-600">Pizzas artesanales a la piedra con quesos locales.</p>
                                    </div>
                                    <a href="tel:3446204025" className="text-sage text-xl opacity-50 hover:opacity-100">📞</a>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div>
                                        <h5 className="font-bold text-forest">La Farola</h5>
                                        <p className="text-xs text-gray-400 font-bold tracking-widest mb-2">PATRIARCA 1431</p>
                                        <p className="text-sm text-gray-600">Pizzas, empanadas y minutas de calidad.</p>
                                    </div>
                                    <a href="tel:3446582124" className="text-sage text-xl opacity-50 hover:opacity-100">📞</a>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h6 className="font-bold text-sm text-forest">Rotisería Al Toque</h6>
                                        <p className="text-[10px] text-gray-500">Comida casera para llevar</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h6 className="font-bold text-sm text-forest">Morfi</h6>
                                        <p className="text-[10px] text-gray-500">Comidas Rápidas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Regional Products Highlight */}
                            <div className="mt-8 bg-[#e8d5b5]/30 p-8 rounded-3xl border border-[#e8d5b5] relative overflow-hidden">
                                <div className="absolute right-0 top-0 text-6xl opacity-10">🍯</div>
                                <h5 className="font-script text-5xl md:text-6xl text-forest mb-2">Para llevar a casa</h5>
                                <p className="text-sm text-gray-700 mb-4">
                                    No te vayas sin visitar <strong>"Oto Cuche"</strong> o las ferias de emprendedores. Salame ahumado, miel multifloral, escabeches de ciervo y licores artesanales son los souvenirs perfectos.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. TURISMO Y ECONOMÍA (Circuitos & Precios) */}
                <section id="info" className="scroll-mt-32 pb-20 border-t border-gray-100 pt-20">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div>
                            <Editable
                                id="gastronomia.section5.title1"
                                defaultValue="Circuitos Recomendados"
                                className="text-5xl md:text-6xl font-script text-forest mb-6 block"
                                label="Título Circuitos"
                            />
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="text-2xl">🚜</span>
                                    <div>
                                        <h5 className="font-bold text-gray-800 text-sm md:text-base">Circuito Aldeas Alemanas</h5>
                                        <p className="text-xs md:text-sm text-gray-500">Visita a familias productoras de conservas.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-2xl">🍷</span>
                                    <div>
                                        <h5 className="font-bold text-gray-800 text-sm md:text-base">Ruta de los Badenes y Los Bayos</h5>
                                        <p className="text-xs md:text-sm text-gray-500">Degustación de vinos y paisajes de nuez pecán.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-2xl">⛪</span>
                                    <div>
                                        <h5 className="font-bold text-gray-800 text-sm md:text-base">Circuito de la Fe y Sabores</h5>
                                        <p className="text-xs md:text-sm text-gray-500">10 iglesias y paradas en panaderías históricas.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <Editable
                                id="gastronomia.section5.title2"
                                defaultValue="Tendencias 2025"
                                className="text-5xl md:text-6xl font-script text-forest mb-6 block"
                                label="Título Tendencias"
                            />
                            <div className="bg-sage/10 p-8 rounded-3xl">
                                <Editable
                                    id="gastronomia.tendencias.text1"
                                    type="textarea"
                                    defaultValue="Urdinarrain se posiciona este 2025 como un destino accesible de alta calidad. Los precios de referencia permiten disfrutar de la gastronomía regional sin presiones inflacionarias extremas."
                                    className="text-sm text-gray-700 leading-relaxed mb-4 block"
                                    label="Texto Tendencias"
                                />
                                <div className="text-xs font-bold text-forest tracking-widest uppercase">
                                    COMENTARIO DESTACADO
                                </div>
                                <Editable
                                    id="gastronomia.tendencias.quote"
                                    type="textarea"
                                    defaultValue='"La relación precio-calidad en bodegones como El Parador o en productos como el dulce de leche de La Pequeña es imbatible en la región."'
                                    className="italic text-gray-500 text-sm mt-2 block"
                                    label="Cita Destacada"
                                />
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    );
};

export default Gastronomia;

