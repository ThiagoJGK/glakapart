import React from 'react';
import Editable from '@/components/ui/Editable';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Link from 'next/link';

const Lugares: React.FC = () => {
    return (
        <main className="relative z-30 pt-64 md:pt-[480px] pb-32 animate-fade-in group/main">
            {/* Fixed Editable Background */}
            <div className="fixed inset-0 -z-20 w-full h-full">
                <Editable
                    id="lugares.background"
                    type="image"
                    defaultValue="https://www.transparenttextures.com/patterns/cubes.png"
                    className="w-full h-full object-cover opacity-5"
                />
            </div>

            {/* HERO SECTION: Best Tourism Village */}
            <div className="container mx-auto px-6 mb-20 md:mb-32 text-center relative z-10">
                <div className="relative inline-block mb-12">
                    <h2 className="font-script text-7xl md:text-9xl text-forest relative z-20 drop-shadow-sm">Destino Urdinarrain</h2>
                    {/* Badge Overlay */}
                    <div className="absolute -top-12 -right-8 md:-right-16 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-xl flex flex-col items-center justify-center p-4 transform rotate-12 animate-float border-4 border-[#e8d5b5]">
                        <span className="text-[10px] uppercase tracking-widest text-forest font-bold mb-1">UN TURISMO</span>
                        <span className="font-ui font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase bg-[#10595a] text-white px-4 py-2 rounded-full text-center leading-tight">BEST TOURISM VILLAGE</span>
                        <span className="text-xl font-bold text-forest mt-1">2024</span>
                    </div>
                </div>

                {/* Hero Image in Frame */}
                <div className="relative h-[500px] w-full max-w-6xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white transform hover:rotate-0 transition-transform duration-500 mb-16 group">
                    <Editable
                        id="lugares.heroImage"
                        type="image"
                        defaultValue="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920"
                        className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
                        label="Imagen Hero Lugares"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-0 w-full text-center px-4">
                        <p className="text-white/90 text-xl font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                            "Urdinarrain combina la vida rural con experiencias auténticas. Donde el silbato del tren marcó el inicio de una historia de progreso e identidad."
                        </p>
                    </div>
                </div>

                {/* TOURISM TYPES NAVIGATION GRID */}
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['Naturaleza', 'Sabores', 'Aventura', 'Eventos', 'Historia'].map((item, i) => (
                        <a href={`#${item.toLowerCase()}`} key={i} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-white/50 text-forest font-bold text-sm tracking-widest uppercase flex flex-col items-center gap-2 group-link cursor-pointer">
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                                {i === 0 ? '🌿' : i === 1 ? '🍷' : i === 2 ? '🚲' : i === 3 ? '🎉' : '🏛️'}
                            </span>
                            {item}
                        </a>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-6 md:px-12 space-y-24 md:space-y-40">

                {/* 1. AGRO-ECO TURISMO & PLAYA (Naturaleza) */}
                <section id="naturaleza" className="scroll-mt-32">
                    <div className="flex items-end gap-6 mb-12 border-b border-sage/20 pb-6">
                        <span className="text-6xl md:text-8xl font-script text-sage/40 -mb-6 relative z-0">01</span>
                        <h3 className="text-3xl md:text-5xl font-ui font-black text-forest relative z-10 leading-tight">NATURALEZA Y PLAYA</h3>
                    </div>

                    <div className="bg-forest rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
                        {/* Decorative BG */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

                        <div className="flex flex-col lg:flex-row gap-16 items-center relative z-10">
                            <div className="lg:w-1/2 w-full">
                                <div className="h-[500px] w-full relative">
                                    <div className="absolute inset-0 border-[12px] border-white/90 shadow-2xl rounded-3xl z-10 overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-700">
                                        <Editable
                                            id="lugares.nature.image"
                                            type="image"
                                            defaultValue="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800"
                                            className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-1000"
                                            label="Foto Arenas Blancas"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-1/2 text-white">
                                <Editable id="lugares.nature.badge" defaultValue="BALNEARIO MUNICIPAL" className="font-ui tracking-[0.2em] text-[10px] md:text-xs text-white font-bold block mb-4 bg-[#10595a] w-fit px-4 py-2 rounded-full" label="Badge" />
                                <Editable id="lugares.nature.title" defaultValue="Arenas Blancas" className="font-script text-7xl mb-8 block text-white drop-shadow-md" label="Título" />
                                <Editable
                                    id="lugares.nature.desc"
                                    type="textarea"
                                    defaultValue="El gran protagonista del verano. Ubicado a 20 km de la ciudad sobre el río Gualeguay, ofrece 400 metros de playas de arena finísima y 16 hectáreas de monte nativo."
                                    className="text-white/80 leading-relaxed font-light mb-10 text-lg block"
                                    label="Descripción"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                        <div className="text-2xl mb-2">🏕️</div>
                                        <h4 className="font-bold text-sm mb-1">CAMPING</h4>
                                        <p className="text-xs text-white/70">Ideal para acampar bajo las estrellas.</p>
                                    </div>
                                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                        <div className="text-2xl mb-2">🎣</div>
                                        <h4 className="font-bold text-sm mb-1">PESCA</h4>
                                        <p className="text-xs text-white/70">Zonas habilitadas en el río.</p>
                                    </div>
                                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                        <div className="text-2xl mb-2">🦅</div>
                                        <h4 className="font-bold text-sm mb-1">ECOTURISMO</h4>
                                        <p className="text-xs text-white/70">Senderismo en selva en galería.</p>
                                    </div>
                                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                        <div className="text-2xl mb-2">🌅</div>
                                        <h4 className="font-bold text-sm mb-1">ATARDECERES</h4>
                                        <p className="text-xs text-white/70">Momentos mágicos y únicos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. TURISMO PRODUCTIVO (Sabores) */}
                <section id="sabores" className="scroll-mt-32">
                    <div className="flex items-end gap-6 mb-12 border-b border-sage/20 pb-6 justify-end text-right">
                        <h3 className="text-4xl md:text-5xl font-ui font-black text-forest relative z-10">SABORES CON HISTORIA</h3>
                        <span className="text-6xl md:text-8xl font-script text-sage/40 -mb-6 relative z-0">02</span>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-1/2 space-y-6">
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Urdinarrain es famosa por sus productos artesanales premiados. Desde el <strong>Dulce de Leche "La Pequeña"</strong> (Medalla de Oro), pasando por los vinos de <strong>Finca Los Bayos</strong>, hasta los panificados de horno a leña de <strong>Panadería Ceferino</strong>.
                            </p>
                            <Link href="/gastronomia" className="inline-flex items-center gap-3 bg-forest text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase text-xs hover:bg-sage transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <span>Ver Ruta Gastronómica</span>
                                <span className="text-xl">→</span>
                            </Link>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-4">
                            <Editable
                                id="lugares.sabores.image1"
                                type="image"
                                defaultValue="https://images.unsplash.com/photo-1627341872134-2e21b7145749?auto=format&fit=crop&q=80&w=400"
                                className="rounded-2xl shadow-md rotate-2 aspect-[4/5] overflow-hidden"
                                label="Foto Sabores 1"
                            />
                            <Editable
                                id="lugares.sabores.image2"
                                type="image"
                                defaultValue="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=400"
                                className="rounded-2xl shadow-md -rotate-2 mt-8 aspect-[4/5] overflow-hidden"
                                label="Foto Sabores 2"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. TURISMO AVENTURA (Nuevo) */}
                <section id="aventura" className="scroll-mt-32">
                    <div className="flex items-end gap-6 mb-12 border-b border-sage/20 pb-6">
                        <span className="text-6xl md:text-8xl font-script text-sage/40 -mb-6 relative z-0">03</span>
                        <h3 className="text-4xl md:text-5xl font-ui font-black text-forest relative z-10">AVENTURA Y ACTIVO</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Planeadores */}
                        <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500">
                            <div className="h-64 overflow-hidden relative">
                                <Editable
                                    id="lugares.adventure.plane.image"
                                    type="image"
                                    defaultValue="https://images.unsplash.com/photo-1520636254070-07973d09a061?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h4 className="font-script text-4xl mb-1">Vuelos en Planeador</h4>
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Vuelos de bautismo los fines de semana en el Club de Planeadores. Una experiencia increíble para ver las lomadas entrerrianas desde el silencio del aire.
                                </p>
                                <span className="inline-block px-4 py-2 bg-sage/10 text-forest text-xs font-bold rounded-full tracking-widest">SÁBADOS Y DOMINGOS</span>
                            </div>
                        </div>

                        {/* Cicloturismo */}
                        <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500">
                            <div className="h-64 overflow-hidden relative">
                                <Editable
                                    id="lugares.adventure.bike.image"
                                    type="image"
                                    defaultValue="https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=800"
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h4 className="font-script text-4xl mb-1">Cicloturismo</h4>
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    Circuitos rurales autoguiados que conectan el casco urbano con aldeas vecinas. Caminos de tierra y ripio ideales para recorrer sobre dos ruedas.
                                </p>
                                <span className="inline-block px-4 py-2 bg-sage/10 text-forest text-xs font-bold rounded-full tracking-widest">CIRCUITOS LIBRES</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. TURISMO DE EVENTOS (Nuevo) */}
                <section id="eventos" className="scroll-mt-32">
                    <div className="flex items-end gap-6 mb-12 border-b border-sage/20 pb-6 justify-end text-right">
                        <h3 className="text-4xl md:text-5xl font-ui font-black text-forest relative z-10">GRANDES FIESTAS</h3>
                        <span className="text-6xl md:text-8xl font-script text-sage/40 -mb-6 relative z-0">04</span>
                    </div>

                    <div className="bg-[#10595a] rounded-[3rem] p-10 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                        <div className="grid md:grid-cols-2 gap-12 relative z-10">
                            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
                                <div className="text-4xl mb-4">🐴</div>
                                <h4 className="font-bold text-2xl mb-2 font-ui uppercase tracking-widest text-[#e8d5b5]">Fiesta del Caballo</h4>
                                <span className="text-xs font-bold bg-white text-forest px-3 py-1 rounded mb-4 inline-block">ENERO</span>
                                <p className="text-white/80 leading-relaxed">
                                    El evento más grande con desfiles de más de 1.000 caballos, agrupaciones tradicionalistas, jineteadas y folclore. Un homenaje vivo a la tradición gaucha.
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
                                <div className="text-4xl mb-4">🍻</div>
                                <h4 className="font-bold text-2xl mb-2 font-ui uppercase tracking-widest text-[#e8d5b5]">Fiesta de la Cerveza</h4>
                                <span className="text-xs font-bold bg-white text-forest px-3 py-1 rounded mb-4 inline-block">NOVIEMBRE</span>
                                <p className="text-white/80 leading-relaxed">
                                    Tributo a la herencia de los Alemanes del Volga. Música típica, gastronomía europea y el espíritu festivo de la comunidad.
                                </p>
                            </div>
                        </div>
                        <div className="text-center mt-10">
                            <Link href="/eventos" className="text-[#e8d5b5] font-bold tracking-widest text-sm hover:text-white transition-colors border-b border-[#e8d5b5] pb-1">VER CALENDARIO COMPLETO</Link>
                        </div>
                    </div>
                </section>

                {/* 5. TURISMO HISTÓRICO (Deep Content) */}
                <section id="historia" className="scroll-mt-32">
                    <div className="text-center mb-16">
                        <span className="text-6xl md:text-8xl font-script text-sage/40 block mb-4">05</span>
                        <h3 className="text-4xl md:text-5xl font-ui font-black text-forest mb-6">IDENTIDAD Y MEMORIA</h3>
                        <div className="w-24 h-1 bg-[#e8d5b5] rounded-full mx-auto"></div>
                    </div>

                    {/* The Station & General Urdinarrain */}
                    <div className="grid lg:grid-cols-2 gap-16 mb-24">
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                                <h4 className="font-script text-4xl text-forest mb-4">La Génesis Ferroviaria</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    Urdinarrain no nació de un acto protocolar, sino del silbato del primer tren el <strong>23 de septiembre de 1890</strong>. La estación fue el corazón pulsante que transformó la estepa ganadera en un polo agroindustrial.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                                <h4 className="font-script text-4xl text-forest mb-4">El General Urdinarrain</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    Manuel Antonio Urdinarrain (1800-1869), figura clave junto a Urquiza. Comandó una división en la Batalla de Caseros y fue constituyente. Su apellido, de origen vasco ("lugar de hierro"), resultó profético para una ciudad nacida del riel.
                                </p>
                            </div>
                        </div>
                        {/* Station Image Stack */}
                        <div className="relative h-[400px]">
                            <Editable
                                id="lugares.history.image1"
                                type="image"
                                defaultValue="https://images.unsplash.com/photo-1543360210-2384738590c6?auto=format&fit=crop&q=80&w=800"
                                className="absolute top-0 right-0 w-4/5 h-4/5 rounded-[2rem] shadow-xl z-10 border-4 border-white transform rotate-3 overflow-hidden"
                                label="Foto Estación 1"
                            />
                            <Editable
                                id="lugares.history.image2"
                                type="image"
                                defaultValue="https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?auto=format&fit=crop&q=80&w=800"
                                className="absolute bottom-0 left-0 w-4/5 h-4/5 rounded-[2rem] shadow-xl border-4 border-white transform -rotate-2 opacity-80 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden"
                                label="Foto Estación 2"
                            />
                        </div>
                    </div>

                    {/* Timeline/Immigration Sections */}
                    <div className="space-y-12">
                        {/* Immigrants */}
                        <div className="bg-[#f4f1ea] rounded-[3rem] p-10 md:p-14 relative overflow-hidden">
                            <div className="relative z-10 max-w-4xl mx-auto text-center">
                                <h4 className="font-ui text-[10px] md:text-xs font-bold text-white bg-[#10595a] px-4 py-2 rounded-full w-fit tracking-[0.3em] uppercase mb-4">CRISOL DE RAZAS</h4>
                                <h3 className="font-script text-5xl text-forest mb-8">Un Pueblo de Inmigrantes</h3>
                                <div className="grid md:grid-cols-3 gap-8 text-left">
                                    <div>
                                        <h5 className="font-bold text-forest mb-2 border-b border-sage/20 pb-2">Alemanes del Volga</h5>
                                        <p className="text-xs text-gray-600 leading-relaxed">Fundaron aldeas vecinas y trajeron la ética del trabajo agrario, el cooperativismo y su rica gastronomía.</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-forest mb-2 border-b border-sage/20 pb-2">Italianos</h5>
                                        <p className="text-xs text-gray-600 leading-relaxed">Constructores, comerciantes y farmacéuticos. Aportaron la arquitectura neoclásica y las primeras boticas.</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-forest mb-2 border-b border-sage/20 pb-2">Españoles</h5>
                                        <p className="text-xs text-gray-600 leading-relaxed">Pilares en el comercio y la administración cívica de las primeras Juntas de Fomento.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Museums Grid */}
                        <div className="text-center">
                            <h4 className="font-ui font-bold text-forest mb-8">COMPLEJO CULTURAL "LA ESTACIÓN"</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-sage transition-colors">
                                    <span className="block text-3xl mb-3">🏛️</span>
                                    <h5 className="font-script text-2xl text-forest">Museo Histórico</h5>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-sage transition-colors">
                                    <span className="block text-3xl mb-3">🚜</span>
                                    <h5 className="font-script text-2xl text-forest">Museo Agrícola</h5>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-sage transition-colors">
                                    <span className="block text-3xl mb-3">🐎</span>
                                    <h5 className="font-script text-2xl text-forest">Museo Carruajes</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Call to Action */}
                <div className="text-center pb-20">
                    <p className="font-script text-xl md:text-2xl text-stone-500 max-w-2xl mx-auto italic mb-10 px-4">
                        "Un modelo de desarrollo que armoniza el respeto por su patrimonio con una vocación productiva moderna."
                    </p>
                </div>

            </div>
        </main>
    );
};

export default Lugares;


