'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ExternalLink } from 'lucide-react';

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

interface ReviewsProps {
    embedded?: boolean;
}

const Reviews: React.FC<ReviewsProps> = ({ embedded = false }) => {
    // If embedded, be transparent and minimal. Else, use full styling.
    const bgColor = embedded ? 'bg-transparent' : 'bg-[#f4f1ea]';
    const gradientColor = '#f4f1ea'; // Always match the beige theme
    const padding = embedded ? 'py-4' : 'py-24';

    return (
        <section className={`relative overflow-hidden w-full ${bgColor} ${padding}`}>
            <div className="w-full relative z-10">
                {!embedded && (
                    <div className="text-center mb-16 px-4">
                        <span className="text-[#10595a]/60 font-ui tracking-[0.2em] text-sm uppercase block mb-4">Experiencias Reales</span>
                        <h2 className="font-script text-5xl md:text-7xl text-[#10595a] mb-6">Lo que dicen nuestros huéspedes</h2>
                        <div className="flex justify-center gap-1 text-[#90c69e] text-2xl">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} fill="currentColor" />)}
                        </div>
                        <p className="text-[#10595a]/80 mt-2 font-ui tracking-wider text-sm">4.9/5 en Google Maps</p>
                    </div>
                )}

                {/* Marquee Container */}
                <div className="relative w-full overflow-hidden">
                    {/* Gradient Masks for Fade edges */}
                    <div
                        className="absolute top-0 left-0 w-32 h-full z-20 pointer-events-none"
                        style={{ background: `linear-gradient(to right, ${gradientColor}, transparent)` }}
                    ></div>
                    <div
                        className="absolute top-0 right-0 w-32 h-full z-20 pointer-events-none"
                        style={{ background: `linear-gradient(to left, ${gradientColor}, transparent)` }}
                    ></div>

                    <motion.div
                        className="flex gap-8 px-8"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 60, // Slower for readability
                        }}
                        style={{ width: "fit-content" }}
                    >
                        {/* Duplicate the array to create seamless loop */}
                        {[...reviews, ...reviews].map((review, index) => (
                            <div
                                key={`${review.id}-${index}`}
                                className="w-[350px] md:w-[450px] flex-shrink-0 bg-white rounded-3xl p-8 border border-[#10595a]/10 relative group hover:shadow-xl transition-all duration-300 shadow-sm"
                            >
                                <Quote className="absolute top-6 right-6 text-[#10595a]/10 w-10 h-10 group-hover:text-[#90c69e]/30 transition-colors" />

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-[#10595a] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-[#10595a] font-ui tracking-wider font-bold text-sm truncate max-w-[200px]">{review.name}</h3>
                                        <div className="flex text-[#10595a]">
                                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#10595a" />)}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[#10595a]/80 font-light leading-relaxed italic text-sm line-clamp-4">
                                    "{review.text}"
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="text-center mt-12 px-4">
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
            </div >
        </section >
    );
};

export default Reviews;






