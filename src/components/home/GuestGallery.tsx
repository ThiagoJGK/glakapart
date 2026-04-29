'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Editable from '../ui/Editable';
import { Star, Quote, ExternalLink } from 'lucide-react';
import { getContent } from '@/services/content';

const DUMMY_GUESTS = [
    { id: 1, image: '' },
    { id: 2, image: '' },
    { id: 3, image: '' },
    { id: 4, image: '' },
    { id: 5, image: '' }
];

const reviews = [
    {
        id: 1,
        name: "Mercedes Miranda",
        date: "Hace 4 días",
        rating: 5,
        text: "Espectacular todo, si hubiera 10 estrellas para calificar las usaría sin dudas. Si buscan tranquilidad, es el lugar perfecto. Excelente atención de sus dueños... Ideal para desconectar de todo! Lo súper recomiendo."
    },
    {
        id: 2,
        name: "Ricardo Fritzler",
        date: "Hace 2 semanas",
        rating: 5,
        text: "Muy lindo el apart hotel. Habitaciones cómodas, y muy acogedoras. Hermosa pileta para los días de calor. Los dueños muy amables y dispuestos. Recomiendo el lugar cuando pasen por Urdinarrain."
    },
    {
        id: 3,
        name: "Francisco Genero",
        date: "Hace 3 semanas",
        rating: 5,
        text: "Atendidos por sus dueños. Super amables y explicativos. La pileta perfecta. Muchos lugares para sentarse en el patio. Las habitaciones muy lindas y nuevas."
    },
    {
        id: 4,
        name: "Soledad Galliusi",
        date: "Hace 3 semanas",
        rating: 5,
        text: "Excelente todo! Muy amable Gladis y su marido! Lo recomiendo para un finde largo y si es verano mejor su hermosa pileta!"
    },
    {
        id: 5,
        name: "Matias Ryba",
        date: "Hace 2 días",
        rating: 5,
        text: "La verdad que el apart es impecable, las habitaciones súper confortables y muy bien equipadas. Los espacios en común siempre en orden y limpios, la pileta hermosa."
    },
    {
        id: 6,
        name: "Juan Jose Lombardo",
        date: "Hace 4 meses",
        rating: 5,
        text: "CALIDEZ EN SU MAYOR ESPLENDOR ☺️ además de no faltarle nada... te reciben con un dúo, Gladis y Adrián, que desarrollan una actuación que no tiene desperdicio 😂 Muy recomendable!"
    },
    {
        id: 7,
        name: "Daniel Trnka",
        date: "Hace 5 meses",
        rating: 5,
        text: "Con la experiencia de haber conocido muchos alojamientos de pequeñas ciudades y pueblos del país puedo decir que Glak es uno de los mejores locales para visitar."
    },
    {
        id: 8,
        name: "Viviana De Melo",
        date: "Hace 5 meses",
        rating: 5,
        text: "Glak apart es excelente. Las instalaciones son cómodas e impecables, y la atención brindada por los anfitriones, Gladys y Adrián, es insuperable. Se nota la pasión y el compromiso."
    },
    {
        id: 9,
        name: "Elsa Beatriz Moreda",
        date: "Hace 5 meses",
        rating: 5,
        text: "Excelente ubicación del establecimiento y la atención de sus dueños Gladys y Adrián espectacular. Muy buen lugar, tranquilo y muy confortable. Pasamos muy lindos días."
    },
    {
        id: 10,
        name: "Viktor-zerocool",
        date: "Hace 5 meses",
        rating: 5,
        text: "La hospitalidad y amabilidad de Adri es increíble. La casita que nos tocó, súper equipada, cómoda un lujo. Llegamos con frío y ya nos estaba esperando con la casa calentita."
    },
    {
        id: 11,
        name: "Ignacio Saip",
        date: "Hace 6 meses",
        rating: 5,
        text: "Sin dudas es un lugar super recomendable, la atención de sus dueños es maravillosa y están pendientes de cada detalle. Hermoso lugar, hermosa ciudad para ir y disfrutar."
    },
    {
        id: 12,
        name: "Alfonsina Korell",
        date: "Hace 4 meses",
        rating: 5,
        text: "Excelentes cabañas ideal para descansar y disfrutar. Muy buena recepción, confort y servicios. Muchas gracias recomendamos!!"
    },
    {
        id: 13,
        name: "Eduardo DI COSTANZO",
        date: "Hace 4 meses",
        rating: 5,
        text: "Fuimos con mi Pareja el fin de semana, en busca de tranquilidad. Nos sorprendimos muy gratamente. Muy buenas instalaciones. Nos encantó la Ciudad."
    },
    {
        id: 14,
        name: "Rosi Torri",
        date: "Hace 5 meses",
        rating: 5,
        text: "Excelente!!! No solo es hermoso como se ve en las fotos, es super cómodo! Atendido por sus propios dueños, super amables y cordiales."
    },
    {
        id: 15,
        name: "Sonia Micheli",
        date: "Hace 8 meses",
        rating: 5,
        text: "Muy recomendable, hermoso lugar, instalaciones excelentes, muy cómodo, pileta, asador. Los anfitriones están atentos a cualquier necesidad e inquietud. Volveré sin duda!"
    },
    {
        id: 16,
        name: "Lucas Balverdi",
        date: "Hace 1 semana",
        rating: 5,
        text: "Hermoso lugar. Los súper recomiendo 🥰 Habitación impecable y excelente atención."
    }
];

// --- Arc geometry constants ---
const ARC_ANGLE_STEP = 16;    // degrees between each card
const ARC_RADIUS = 900;       // radius of the virtual cylinder (px)
const CARD_WIDTH_DESKTOP = 200;
const CARD_WIDTH_MOBILE = 140;

function getCardTransform(idx: number, total: number, isMobile: boolean) {
    const center = (total - 1) / 2;
    const offset = idx - center;
    const angle = offset * ARC_ANGLE_STEP;
    const radius = isMobile ? ARC_RADIUS * 0.45 : ARC_RADIUS;

    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius - radius;

    const absOffset = Math.abs(offset);
    const opacity = Math.max(0.3, 1 - absOffset * 0.15);
    const scale = Math.max(0.75, 1 - absOffset * 0.04);

    return {
        transform: `translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg) scale(${scale})`,
        opacity,
        zIndex: total - Math.round(absOffset),
    };
}

const GuestGallery: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [activeIndex, setActiveIndex] = useState(5); // center card initially
    const [guestGallery, setGuestGallery] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        const fetchContent = async () => {
            const data = await getContent('home');
            if (data && data['home.guests.gallery']) {
                setGuestGallery(data['home.guests.gallery']);
            }
            setLoaded(true);
        };
        fetchContent();
    }, []);

    const activeGuests = guestGallery.length > 0 
        ? guestGallery.map((img, i) => ({ id: i, image: img })) 
        : DUMMY_GUESTS;

    // Slow auto-rotation
    useEffect(() => {
        if (!loaded || activeGuests.length === 0) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % activeGuests.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [loaded, activeGuests.length]);

    const cards = useMemo(() => {
        const total = activeGuests.length;
        if (total === 0) return [];
        return activeGuests.map((guest, idx) => {
            const shiftedIdx = ((idx - activeIndex + total) % total);
            const style = getCardTransform(shiftedIdx, total, isMobile);
            return { ...guest, style, displayIdx: shiftedIdx };
        });
    }, [activeIndex, isMobile, activeGuests]);

    const cardWidth = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
    const cardHeight = cardWidth * (16 / 9);

    return (
        <section className="py-20 md:py-32 relative overflow-hidden bg-[#f4f1ea]">
            {/* Header */}
            <div className="container mx-auto px-4 text-center mb-12 md:mb-16 relative z-20">
                <Editable
                    id="home.guests.badge"
                    defaultValue="Experiencias Reales"
                    className="font-ui text-[10px] md:text-xs tracking-[0.25em] bg-transparent border border-[#10595a]/20 text-[#10595a]/70 px-4 py-2 rounded-full w-fit uppercase font-bold mb-6 mx-auto inline-block"
                    label="Insignia Huéspedes"
                />
                <Editable
                    id="home.guests.title"
                    defaultValue="Nuestros Huéspedes"
                    className="font-script text-5xl md:text-7xl text-[#10595a] mb-4 block"
                    label="Título Huéspedes"
                />
                <Editable
                    id="home.guests.subtitle"
                    defaultValue="Momentos que se viven en Glak Apart"
                    className="font-ui tracking-widest text-sm text-[#10595a]/50 block"
                    label="Subtítulo Huéspedes"
                />
            </div>

            {/* 3D Arc Container */}
            <div
                className="relative w-full flex items-center justify-center mb-8 md:mb-12"
                style={{
                    perspective: '1200px',
                    perspectiveOrigin: '50% 50%',
                    height: `${cardHeight + 40}px`,
                }}
            >
                <div
                    className="relative"
                    style={{
                        transformStyle: 'preserve-3d',
                        width: `${cardWidth}px`,
                        height: `${cardHeight}px`,
                    }}
                >
                    {cards.map((card) => (
                            <div
                                key={card.id}
                                className="absolute top-0 left-0 transition-[transform,opacity] duration-700 ease-out cursor-pointer"
                            style={{
                                width: `${cardWidth}px`,
                                height: `${cardHeight}px`,
                                transform: card.style.transform,
                                opacity: card.style.opacity,
                                zIndex: card.style.zIndex,
                                transformStyle: 'preserve-3d',
                            }}
                            onClick={() => setActiveIndex(activeGuests.findIndex(g => g.id === card.id))}
                        >
                            <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-[#10595a]/10 flex items-center justify-center">
                                {card.image ? (
                                    <img
                                        src={card.image}
                                        alt="Huésped de Glak Apart"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#10595a]/30">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation dots (Removed per plan step 6) */}

            {/* Reviews Section Merged */}
            <div className="w-full relative z-10">
                <div className="text-center mb-12 px-4">
                    <div className="flex justify-center gap-1 text-[#90c69e] text-3xl mb-2">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} fill="currentColor" />)}
                    </div>
                    <Editable
                        id="home.reviews.subtitle"
                        defaultValue="4.9/5 en Google Maps"
                        className="text-[#10595a]/80 font-ui tracking-wider text-sm md:text-base font-bold block"
                        label="Rating Text"
                    />
                    <Editable
                        id="home.reviews.count"
                        defaultValue="Más de 70 reseñas"
                        className="text-[#10595a]/60 font-ui tracking-wider text-xs md:text-sm block mt-1"
                        label="Cantidad de reseñas"
                    />
                </div>

                {/* Marquee Container */}
                <div className="relative w-full overflow-hidden">
                    {/* Gradient Masks */}
                    <div
                        className="absolute top-0 left-0 w-24 md:w-40 h-full z-20 pointer-events-none"
                        style={{ background: `linear-gradient(to right, #f4f1ea, transparent)` }}
                    ></div>
                    <div
                        className="absolute top-0 right-0 w-24 md:w-40 h-full z-20 pointer-events-none"
                        style={{ background: `linear-gradient(to left, #f4f1ea, transparent)` }}
                    ></div>

                    {/* CSS Marquee */}
                    <div className="animate-marquee flex gap-8 px-8 w-max">
                        {[...reviews, ...reviews].map((review, index) => (
                            <div
                                key={`${review.id}-${index}`}
                                className="w-[300px] md:w-[400px] flex-shrink-0 bg-white rounded-3xl p-6 md:p-8 border border-[#10595a]/10 relative group hover:shadow-xl transition-all duration-300 shadow-sm"
                            >
                                <Quote className="absolute top-6 right-6 text-[#10595a]/10 w-8 h-8 md:w-10 md:h-10 group-hover:text-[#90c69e]/30 transition-colors" />

                                <div className="flex items-center gap-4 mb-4 md:mb-6">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#10595a] flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0 shadow-md">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-[#10595a] font-ui tracking-wider font-bold text-xs md:text-sm truncate max-w-[150px] md:max-w-[200px]">{review.name}</h3>
                                        <div className="flex text-[#10595a]">
                                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} fill="#10595a" />)}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[#10595a]/80 font-light leading-relaxed italic text-xs md:text-sm line-clamp-4">
                                    "{review.text}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12 px-4 relative z-30">
                    <a
                        href="https://www.google.com/search?q=Glak+Apart+Urdinarrain"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#10595a] text-white px-8 py-4 rounded-full font-ui tracking-[0.15em] text-xs font-bold hover:bg-[#90c69e] hover:text-[#10595a] transition-all duration-300 group shadow-lg hover:shadow-xl"
                    >
                        LEER MÁS RESEÑAS EN GOOGLE
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default GuestGallery;
