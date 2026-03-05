
export type ApartmentKey = 'nacarado' | 'arrebol' | 'arje';

export const apartmentData: Record<ApartmentKey, any> = {
    nacarado: {
        name: "Nacarado",
        tagline: "Intimidad y Confort Familiar",
        description: "Nacarado es el refugio perfecto para pequeñas familias o grupos de amigos que buscan calidez. Su diseño integra materiales nobles con una luminosidad que invita a la calma. Disfruta de su cocina totalmente equipada para preparar tus platos favoritos y un descanso reparador en su dormitorio privado.",
        capacity: "3-4 Pasajeros",
        features: ["Dormitorio Independiente", "Baño Privado", "Cocina Equipada", "Aire Acondicionado", "WiFi Alta Velocidad", "Smart TV"],
        images: [
            "", // Hero
            "", // Detail 1
            "", // Detail 2
            ""  // Detail 3
        ]
    },
    arrebol: {
        name: "Arrebol",
        tagline: "Amplitud en la Naturaleza",
        description: "Con una arquitectura pensada para capturar los colores del atardecer, Arrebol ofrece un espacio amplio y versátil. Ideal para quienes disfrutan de compartir momentos en el living o relajarse viendo una película después de un día de piscina. La conexión con el exterior es protagonista.",
        capacity: "4-5 Pasajeros",
        features: ["Dormitorio Independiente", "Cocina Completa", "Vista al Parque", "Desayunador", "Smart TV 50\"", "Estacionamiento"],
        images: [
            "",
            "",
            "",
            ""
        ]
    },
    arje: {
        name: "Arje",
        tagline: "El Rincón Romántico",
        description: "Nuestro apartamento más exclusivo, diseñado pensando en las parejas. Situado frente a la piscina, Arje combina privacidad con las mejores vistas del complejo. Un espacio íntimo, moderno y lleno de detalles para una escapada inolvidable.",
        capacity: "2 Pasajeros (Parejas)",
        features: ["Frente a Piscina", "Cama Queen", "Diseño Boutique", "Cocina Kitchenette", "Terraza Privada", "Ambiente Romántico"],
        images: [
            "",
            "",
            "",
            ""
        ]
    }
};


