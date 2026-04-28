export const SAMPLE_DATA: Record<string, any> = {
    settings: {
        season_summer: "",
        season_autumn: "",
        season_winter: "",
        season_spring: "",
        header_home_bg: "",
        header_gastronomia_bg: "",
        header_lugares_bg: "",
        header_eventos_bg: "",
        header_apartamentos_bg: ""
    },
    general: {
        "home.apartments.nacarado.bg": "",
        "home.apartments.arrebol.bg": "",
        "home.apartments.arje.bg": "",

        // Home
        "home.common.pool.image": "",
        "home.common.garden.image": "",

        // Lugares
        "lugares.nature.image": "",
        "lugares.sabores.image1": "",
        "lugares.sabores.image2": "",
        "lugares.adventure.plane.image": "",
        "lugares.adventure.bike.image": "",
        "lugares.history.image1": "",
        "lugares.history.image2": "",

        // Gastronomia
        "gastronomia.ceferino.image": "",
        "gastronomia.pequena.image": "",
        "gastronomia.finca.image": ""
    },
    home: {
        "heroImage.0": "",
        "heroImage.1": "",
        "heroImage.2": "",
        common: {
            pool: {
                image: ""
            },
            garden: {
                image: ""
            }
        },
        apartments: {
            nacarado: { bg: "" },
            arrebol: { bg: "" },
            arje: { bg: "" }
        }
    },
    lugares: {
        background: "https://www.transparenttextures.com/patterns/cubes.png",
        heroImage: "",
        nature: {
            image: ""
        },
        sabores: {
            image1: "",
            image2: ""
        },
        adventure: {
            plane: { image: "" },
            bike: { image: "" }
        },
        history: {
            image1: "",
            image2: ""
        }
    },
    gastronomia: {
        background: "https://www.transparenttextures.com/patterns/cubes.png",
        heroImage: "",
        ceferino: {
            image: ""
        },
        pequena: {
            image: ""
        },
        finca: {
            image: ""
        }
    },
    events: {
        items: [
            {
                id: "sample-event-1",
                title: "Fiesta Provincial del Caballo",
                description: "La celebración más grande de Urdinarrain. Jineteadas, desfiles tradicionales, música folclórica en vivo y la mejor gastronomía criolla bajo las estrellas.",
                startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
                endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                image: "",
                type: "cultural"
            },
            {
                id: "sample-event-2",
                title: "Atardecer en los Viñedos",
                description: "Cata exclusiva de vinos de la región en la Finca Los Bayos. Incluye maridaje con quesos locales y música acústica en vivo entre los viñedos.",
                startDate: new Date(Date.now() + 86400000 * 15).toISOString(),
                endDate: new Date(Date.now() + 86400000 * 15).toISOString(),
                image: "",
                type: "gastronomico"
            },
            {
                id: "sample-event-3",
                title: "Encuentro de Vuelo a Vela",
                description: "Competencia nacional de planeadores en el Aeroclub de Urdinarrain. Un espectáculo único en el cielo que también ofrece vuelos de bautismo para el público general.",
                startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
                endDate: new Date(Date.now() + 86400000 * 32).toISOString(),
                image: "",
                type: "deportivo"
            }
        ]
    },
    apartment_nacarado: {
        gallery: [],
        bgId: ""
    },
    apartment_marfil: {
        gallery: [],
        bgId: ""
    },
    apartment_jade: {
        gallery: [],
        bgId: ""
    },
    apartment_arrebol: {
        gallery: []
    },
    apartment_arje: {
        gallery: []
    },
    apartment_ambar: {
        gallery: [],
        bgId: ""
    },
    apartment_agata: {
        gallery: [],
        bgId: ""
    },
    apartment_zafiro: {
        gallery: [],
        bgId: ""
    },
    apartment_lapislazuli: {
        gallery: [],
        bgId: ""
    },
    apartment_jaspe: {
        gallery: [],
        bgId: ""
    }
};

/**
 * Merges missing properties recursively. If `realData` lacks a value (empty, undefined, null),
 * it fills it in with `sampleData`.
 */
export const applySampleData = (realData: any, sampleData: any): any => {
    if (!realData) return sampleData;
    if (!sampleData) return realData;

    // Direct string logic: if realData is an empty string, use sample
    if (typeof realData === 'string') {
        return realData.trim() === '' ? sampleData : realData;
    }

    // Array logic: if empty, take sample
    if (Array.isArray(realData)) {
        return realData.length > 0 ? realData : sampleData;
    }

    if (typeof realData === 'object' && realData !== null) {
        const merged = { ...realData };
        // We also want to map flat dotted keys like "heroImage.0"
        // But since our sampleData might be flat for those keys, we iterate sampleData keys
        for (const key in sampleData) {
            if (merged[key] === undefined || merged[key] === null || merged[key] === '') {
                merged[key] = sampleData[key];
            } else if (typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
                merged[key] = applySampleData(merged[key], sampleData[key]);
            } else if (Array.isArray(merged[key]) && merged[key].length === 0) {
                merged[key] = sampleData[key];
            }
        }
        return merged;
    }

    return realData;
};


