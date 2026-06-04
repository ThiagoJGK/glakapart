import React from 'react';
import Editable from '@/components/ui/Editable';
import ScrollReveal from '@/components/ui/ScrollReveal';

const Gastronomia: React.FC = () => {
    return (
        <main className="relative z-30 pt-64 md:pt-[480px] pb-32 animate-fade-in group/main">
            {/* SEO: Semantic H1 */}
            <Editable
                id="gastronomia.seo.h1"
                defaultValue="Gastronomía en Urdinarrain — Ruta de sabores, Entre Ríos | Glak Apart"
                className="sr-only"
                label="SEO H1"
            />
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
                        defaultValue=""
                        className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
                        label="Imagen Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-0 w-full text-center px-4">
                        <Editable
                            id="gastronomia.hero.description"
                            type="textarea"
                            defaultValue='"Una identidad culinaria forjada entre la pampa criolla y la herencia de los alemanes del Volga. Un modelo de &apos;kilómetro cero&apos; donde la historia se saborea."'
                            className="text-white/90 text-lg font-light max-w-3xl mx-auto leading-relaxed drop-shadow-md block font-sans"
                            label="Descripción Hero"
                        />
                    </div>
                </div>

                {/* HISTORICAL CONTEXT */}
                <ScrollReveal>
                    <div className="max-w-4xl mx-auto text-center mb-32 space-y-8">
                        <Editable
                            id="gastronomia.history.title"
                            defaultValue="Génesis Histórica"
                            className="text-5xl md:text-6xl font-script text-forest block"
                            label="Título Génesis Histórica"
                        />
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
                                            <Editable id="gastronomia.ceferino.feat1.title" defaultValue="HORNO A LEÑA" className="font-bold text-forest text-sm block" label="Ceferino Feat 1 Título" />
                                            <Editable id="gastronomia.ceferino.feat1.desc" defaultValue="Alimentado con espinillo o ñandubay para un aroma unique." className="text-xs text-gray-600 block" label="Ceferino Feat 1 Desc" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <span className="text-2xl mt-1">🍯</span>
                                        <div>
                                            <Editable id="gastronomia.ceferino.feat2.title" defaultValue="ESPECIALIDADES" className="font-bold text-forest text-sm block" label="Ceferino Feat 2 Título" />
                                            <Editable id="gastronomia.ceferino.feat2.desc" defaultValue="Ochenta Golpes, Galletitas de Miel y Pan Dulce." className="text-xs text-gray-600 block" label="Ceferino Feat 2 Desc" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative aspect-video lg:h-[500px] h-auto w-full rounded-[2rem] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                                <Editable
                                    id="gastronomia.ceferino.image"
                                    type="image"
                                    defaultValue=""
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
                        <Editable
                            id="gastronomia.productores.title"
                            defaultValue="PRODUCTORES PREMIADOS"
                            className="text-3xl md:text-5xl font-ui font-black text-forest relative z-10 break-words block"
                            label="Título Productores"
                        />
                        {/* Number removed */}
                    </div>

                    <div className="space-y-24">
                        {/* La Pequeña */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-12 group hover:shadow-2xl transition-all">
                            <div className="md:w-5/12 aspect-video lg:h-[350px] h-auto relative overflow-hidden rounded-2xl">
                                <Editable
                                    id="gastronomia.pequena.image"
                                    type="image"
                                    defaultValue=""
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
                                    defaultValue=""
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
                                    <Editable id="gastronomia.finca.feat1" defaultValue="MARSELAN" className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-forest border border-gray-100 block" label="Finca Item 1" />
                                    <Editable id="gastronomia.finca.feat2" defaultValue="CHARDONNAY" className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-forest border border-gray-100 block" label="Finca Item 2" />
                                    <Editable id="gastronomia.finca.feat3" defaultValue="ESPUMANTES" className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-forest border border-gray-100 block" label="Finca Item 3" />
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

                        <div className="grid md:grid-cols-3 gap-6 relative z-10">

                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                <Editable id="gastronomia.snitsup.title" defaultValue="SNITSUP" className="font-bold text-[#e8d5b5] mb-2 font-ui tracking-widest text-sm block" label="Snitsup Título" />
                                <Editable id="gastronomia.snitsup.desc" defaultValue="Sopa dulce de orejones y crema. Tradición de Semana Santa." className="text-xs text-white/80 leading-5 block font-light" label="Snitsup Descripción" />
                            </div>
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                <Editable id="gastronomia.kreppel.title" defaultValue="KREPPEL" className="font-bold text-[#e8d5b5] mb-2 font-ui tracking-widest text-sm block" label="Kreppel Título" />
                                <Editable id="gastronomia.kreppel.desc" defaultValue="La torta frita alemana, infaltable en las meriendas de campo." className="text-xs text-white/80 leading-5 block font-light" label="Kreppel Descripción" />
                            </div>
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                <Editable id="gastronomia.chucrut.title" defaultValue="CHUCRUT" className="font-bold text-[#e8d5b5] mb-2 font-ui tracking-widest text-sm block" label="Chucrut Título" />
                                <Editable id="gastronomia.chucrut.desc" defaultValue="Col fermentada, acompañamiento ideal para carnes y embutidos de cerdo." className="text-xs text-white/80 leading-5 block font-light" label="Chucrut Descripción" />
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
                                <span>🍽️</span> <Editable id="gastronomia.paradores.title" defaultValue="Paradores y Bodegones" className="inline" label="Título Paradores" />
                            </h4>
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <Editable id="gastronomia.place1.name" defaultValue="El Parador Centro" className="font-bold text-forest block" label="Parador 1 Nombre" />
                                        <Editable id="gastronomia.place1.address" defaultValue="AV. LIBERTAD 555" className="text-xs text-gray-400 font-bold tracking-widest mb-2 block" label="Parador 1 Dirección" />
                                        <Editable id="gastronomia.place1.desc" defaultValue="Alta calificación (9.2/10). Platos abundantes y cocina regional auténtica." className="text-sm text-gray-600 block" label="Parador 1 Descripción" />
                                    </div>
                                    <a href="tel:344615560343" className="text-sage text-xl opacity-50 hover:opacity-100 shrink-0">📞</a>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <Editable id="gastronomia.place2.name" defaultValue="Oporto Birrería" className="font-bold text-forest block" label="Parador 2 Nombre" />
                                        <Editable id="gastronomia.place2.address" defaultValue="PATRIARCA 413" className="text-xs text-gray-400 font-bold tracking-widest mb-2 block" label="Parador 2 Dirección" />
                                        <Editable id="gastronomia.place2.desc" defaultValue="Cerveza artesanal, tapeo contemporáneo y finger food. Ambiente joven." className="text-sm text-gray-600 block" label="Parador 2 Descripción" />
                                    </div>
                                    <a href="tel:3446353971" className="text-sage text-xl opacity-50 hover:opacity-100 shrink-0">📞</a>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <Editable id="gastronomia.place3.name" defaultValue="La Tapera" className="font-bold text-forest block" label="Parador 3 Nombre" />
                                        <Editable id="gastronomia.place3.address" defaultValue="PERÓN Y 3 DE FEBRERO" className="text-xs text-gray-400 font-bold tracking-widest mb-2 block" label="Parador 3 Dirección" />
                                        <Editable id="gastronomia.place3.desc" defaultValue="Bodegón rústico con cocina casera." className="text-sm text-gray-600 block" label="Parador 3 Descripción" />
                                    </div>
                                    <a href="tel:344615618663" className="text-sage text-xl opacity-50 hover:opacity-100 shrink-0">📞</a>
                                </div>
                                {/* Condensed List */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <Editable id="gastronomia.place4.name" defaultValue="El Quincho" className="font-bold text-sm text-forest block" label="Parador 4 Nombre" />
                                        <Editable id="gastronomia.place4.type" defaultValue="Parrilla Tradicional" className="text-[10px] text-gray-500 block" label="Parador 4 Tipo" />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <Editable id="gastronomia.place5.name" defaultValue="Acuario Pub" className="font-bold text-sm text-forest block" label="Parador 5 Nombre" />
                                        <Editable id="gastronomia.place5.type" defaultValue="Resto-bar & Coctelería" className="text-[10px] text-gray-500 block" label="Parador 5 Tipo" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pizzerias & Rotiserias */}
                        <div className="space-y-8">
                            <h4 className="flex items-center gap-3 font-bold text-forest text-xl border-b border-gray-200 pb-2">
                                <span>🍕</span> <Editable id="gastronomia.pizzerias.title" defaultValue="Pizzerías y Al Paso" className="inline" label="Título Pizzerías" />
                            </h4>
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <Editable id="gastronomia.pizza1.name" defaultValue="Pizzería Piamonte" className="font-bold text-forest block" label="Pizzería 1 Nombre" />
                                        <Editable id="gastronomia.pizza1.address" defaultValue="3 DE FEBRERO Y PERÓN" className="text-xs text-gray-400 font-bold tracking-widest mb-2 block" label="Pizzería 1 Dirección" />
                                        <Editable id="gastronomia.pizza1.desc" defaultValue="Pizzas artesanales a la piedra con quesos locales." className="text-sm text-gray-600 block" label="Pizzería 1 Descripción" />
                                    </div>
                                    <a href="tel:3446204025" className="text-sage text-xl opacity-50 hover:opacity-100 shrink-0">📞</a>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <Editable id="gastronomia.pizza2.name" defaultValue="La Farola" className="font-bold text-forest block" label="Pizzería 2 Nombre" />
                                        <Editable id="gastronomia.pizza2.address" defaultValue="PATRIARCA 1431" className="text-xs text-gray-400 font-bold tracking-widest mb-2 block" label="Pizzería 2 Dirección" />
                                        <Editable id="gastronomia.pizza2.desc" defaultValue="Pizzas, empanadas y minutas de calidad." className="text-sm text-gray-600 block" label="Pizzería 2 Descripción" />
                                    </div>
                                    <a href="tel:3446582124" className="text-sage text-xl opacity-50 hover:opacity-100 shrink-0">📞</a>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <Editable id="gastronomia.pizza3.name" defaultValue="Rotisería Al Toque" className="font-bold text-sm text-forest block" label="Rotisería 3 Nombre" />
                                        <Editable id="gastronomia.pizza3.type" defaultValue="Comida casera para llevar" className="text-[10px] text-gray-500 block" label="Rotisería 3 Tipo" />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <Editable id="gastronomia.pizza4.name" defaultValue="Morfi" className="font-bold text-sm text-forest block" label="Pizza 4 Nombre" />
                                        <Editable id="gastronomia.pizza4.type" defaultValue="Comidas Rápidas" className="text-[10px] text-gray-500 block" label="Pizza 4 Tipo" />
                                    </div>
                                </div>
                            </div>

                            {/* Regional Products Highlight */}
                            <div className="mt-8 bg-[#e8d5b5]/30 p-8 rounded-3xl border border-[#e8d5b5] relative overflow-hidden">
                                <div className="absolute right-0 top-0 text-6xl opacity-10">🍯</div>
                                <Editable id="gastronomia.regional.title" defaultValue="Para llevar a casa" className="font-script text-5xl md:text-6xl text-forest mb-2 block" label="Título Regalos" />
                                <Editable id="gastronomia.regional.desc" type="textarea" defaultValue="No te vayas sin visitar &lt;strong&gt;&quot;Oto Cuche&quot;&lt;/strong&gt; o las ferias de emprendedores. Salame ahumado, miel multifloral, escabeches de ciervo y licores artesanales son los souvenirs perfectos." className="text-sm text-gray-700 block font-light leading-relaxed" label="Descripción Regalos" />
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
                                        <Editable id="gastronomia.circuit1.title" defaultValue="Circuito Aldeas Alemanas" className="font-bold text-gray-800 text-sm md:text-base block" label="Circuito 1 Título" />
                                        <Editable id="gastronomia.circuit1.desc" defaultValue="Visita a familias productoras de conservas." className="text-xs md:text-sm text-gray-500 block font-light" label="Circuito 1 Descripción" />
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-2xl">🍷</span>
                                    <div>
                                        <Editable id="gastronomia.circuit2.title" defaultValue="Ruta de los Badenes y Los Bayos" className="font-bold text-gray-800 text-sm md:text-base block" label="Circuito 2 Título" />
                                        <Editable id="gastronomia.circuit2.desc" defaultValue="Degustación de vinos y paisajes de nuez pecán." className="text-xs md:text-sm text-gray-500 block font-light" label="Circuito 2 Descripción" />
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-2xl">⛪</span>
                                    <div>
                                        <Editable id="gastronomia.circuit3.title" defaultValue="Circuito de la Fe y Sabores" className="font-bold text-gray-800 text-sm md:text-base block" label="Circuito 3 Título" />
                                        <Editable id="gastronomia.circuit3.desc" defaultValue="10 iglesias y paradas en panaderías históricas." className="text-xs md:text-sm text-gray-500 block font-light" label="Circuito 3 Descripción" />
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

