import { 
    collection, 
    doc, 
    query, 
    orderBy, 
    updateDoc, 
    onSnapshot, 
    addDoc, 
    Timestamp, 
    where,
    getDocs,
    or,
    setDoc,
    increment
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Guest {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    phoneCountryCode?: string;
    email: string;
    inquiryCount: number;
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface Inquiry {
    id: string;
    guestId: string;
    firstName: string;
    lastName: string;
    phone: string;
    phoneCountryCode?: string;
    email: string;
    checkIn: string; // Date string (YYYY-MM-DD)
    checkOut: string; // Date string (YYYY-MM-DD)
    adults: number;
    children: number;
    message?: string;
    status: 'new' | 'read' | 'contacted' | 'confirmed' | 'archived';
    whatsappSent: boolean;
    notes?: string;
    adminNotes?: string; // Keeping for compatibility
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}

export interface CreateInquiryInput {
    firstName: string;
    lastName: string;
    phone: string;
    phoneCountryCode?: string;
    email: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    message?: string;
}

const INQUIRIES_COLLECTION = 'inquiries';
const GUESTS_COLLECTION = 'guests';

/**
 * Create a new inquiry. Deduplicates guests by phone or email.
 */
export const createInquiry = async (data: CreateInquiryInput): Promise<string> => {
    try {
        const { firstName, lastName, phone, phoneCountryCode = '', email, checkIn, checkOut, adults, children, message = '' } = data;
        
        const trimmedEmail = email ? email.trim().toLowerCase() : '';
        const trimmedPhone = phone ? phone.trim().replace(/\D/g, '') : '';

        // Generate a deterministic guest ID to avoid querying the collection (read permission restricted to admin)
        const guestId = trimmedEmail 
            ? `email_${trimmedEmail.replace(/[^a-z0-9._-]/g, '_')}` 
            : `phone_${trimmedPhone}`;
            
        const guestDocRef = doc(db, GUESTS_COLLECTION, guestId);
        const now = Timestamp.now();

        // Write guest information (create if new, update/merge if exists).
        // Since we only create/update, this does not require READ permissions!
        await setDoc(guestDocRef, {
            firstName: firstName || '',
            lastName: lastName || '',
            phone: phone || '',
            phoneCountryCode: phoneCountryCode || '',
            email: trimmedEmail || '',
            inquiryCount: increment(1),
            updatedAt: now
        }, { merge: true });

        // Create inquiry
        const newInquiry = {
            guestId,
            firstName: firstName || '',
            lastName: lastName || '',
            phone: phone || '',
            phoneCountryCode: phoneCountryCode || '',
            email: trimmedEmail || '',
            checkIn,
            checkOut,
            adults: Number(adults) || 0,
            children: Number(children) || 0,
            message: message || '',
            status: 'new' as const,
            whatsappSent: false,
            notes: '',
            adminNotes: '',
            createdAt: now,
            updatedAt: now
        };

        const inquiryRef = await addDoc(collection(db, INQUIRIES_COLLECTION), newInquiry);
        return inquiryRef.id;
    } catch (error) {
        console.error("Error creating inquiry: ", error);
        throw error;
    }
};

/**
 * Fetch inquiries, supporting filters by status. Sorted by createdAt descending.
 */
export const getInquiries = async (filters?: { status?: Inquiry['status'] }): Promise<Inquiry[]> => {
    try {
        const collectionRef = collection(db, INQUIRIES_COLLECTION);
        const q = query(collectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        let inquiries: Inquiry[] = [];
        querySnapshot.forEach((doc) => {
            inquiries.push({
                id: doc.id,
                ...doc.data()
            } as Inquiry);
        });

        if (filters?.status) {
            inquiries = inquiries.filter(i => i.status === filters.status);
        }

        return inquiries;
    } catch (error) {
        console.error("Error getting inquiries: ", error);
        throw error;
    }
};

/**
 * Fetch guests, allowing search by first name, last name, phone, or email.
 */
export const getGuests = async (search?: string): Promise<Guest[]> => {
    try {
        const collectionRef = collection(db, GUESTS_COLLECTION);
        const q = query(collectionRef, orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const guests: Guest[] = [];
        querySnapshot.forEach((doc) => {
            guests.push({
                id: doc.id,
                ...doc.data()
            } as Guest);
        });

        if (search && search.trim()) {
            const term = search.trim().toLowerCase();
            return guests.filter((g) => {
                const firstName = (g.firstName || '').toLowerCase();
                const lastName = (g.lastName || '').toLowerCase();
                const email = (g.email || '').toLowerCase();
                const phone = (g.phone || '').toLowerCase();
                return (
                    firstName.includes(term) ||
                    lastName.includes(term) ||
                    email.includes(term) ||
                    phone.includes(term)
                );
            });
        }

        return guests;
    } catch (error) {
        console.error("Error getting guests: ", error);
        throw error;
    }
};

/**
 * Get all inquiries for a specific guest.
 */
export const getGuestInquiries = async (guestId: string): Promise<Inquiry[]> => {
    try {
        const collectionRef = collection(db, INQUIRIES_COLLECTION);
        const q = query(collectionRef, where('guestId', '==', guestId));
        const querySnapshot = await getDocs(q);
        
        const inquiries: Inquiry[] = [];
        querySnapshot.forEach((doc) => {
            inquiries.push({
                id: doc.id,
                ...doc.data()
            } as Inquiry);
        });

        // Sort in memory by createdAt descending
        return inquiries.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });
    } catch (error) {
        console.error("Error getting guest inquiries: ", error);
        throw error;
    }
};

/**
 * Update inquiry status.
 */
export const updateInquiryStatus = async (id: string, status: Inquiry['status']): Promise<void> => {
    try {
        const docRef = doc(db, INQUIRIES_COLLECTION, id);
        await updateDoc(docRef, { 
            status,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating inquiry status: ", error);
        throw error;
    }
};

/**
 * Update internal notes for an inquiry.
 */
export const updateInquiryNotes = async (id: string, notes: string): Promise<void> => {
    try {
        const docRef = doc(db, INQUIRIES_COLLECTION, id);
        await updateDoc(docRef, { 
            notes,
            adminNotes: notes, // For backward compatibility with existing usages
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error updating inquiry notes: ", error);
        throw error;
    }
};

/**
 * Count of inquiries with status == 'new'.
 */
export const getNewInquiriesCount = async (): Promise<number> => {
    try {
        const collectionRef = collection(db, INQUIRIES_COLLECTION);
        const q = query(collectionRef, where('status', '==', 'new'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error("Error getting new inquiries count: ", error);
        throw error;
    }
};

/**
 * Subscription to all inquiries (real-time changes)
 */
export const subscribeToInquiries = (callback: (inquiries: Inquiry[]) => void) => {
    const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const inquiries: Inquiry[] = [];
        snapshot.forEach((doc) => {
            inquiries.push({
                id: doc.id,
                ...doc.data()
            } as Inquiry);
        });
        callback(inquiries);
    }, (error) => {
        console.error("Error listening to inquiries: ", error);
    });
};

/**
 * Subscription to count of inquiries with status == 'new' (real-time changes)
 */
export const subscribeToNewInquiriesCount = (callback: (count: number) => void) => {
    const q = query(collection(db, INQUIRIES_COLLECTION), where('status', '==', 'new'));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.size);
    }, (error) => {
        console.error("Error listening to new inquiries count: ", error);
    });
};

// Helper to seed sample inquiries for testing if collection is empty
export const seedSampleInquiries = async () => {
    try {
        const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (snap.empty) {
            const sampleInquiries: Omit<Inquiry, 'id'>[] = [
                {
                    guestId: 'dummy-guest-1',
                    firstName: 'Thiago',
                    lastName: 'Gomez',
                    email: 'thiago@example.com',
                    phone: '5491169675050',
                    phoneCountryCode: '54',
                    checkIn: '2026-07-01',
                    checkOut: '2026-07-10',
                    adults: 2,
                    children: 1,
                    message: 'Hola! Quisiera saber si el apartamento Nacarado tiene cochera cubierta y si aceptan mascotas pequeñas. Gracias!',
                    status: 'new',
                    whatsappSent: false,
                    notes: '',
                    adminNotes: '',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                },
                {
                    guestId: 'dummy-guest-2',
                    firstName: 'Adriana',
                    lastName: 'Lopez',
                    email: 'adriana@example.com',
                    phone: '543446554433',
                    phoneCountryCode: '54',
                    checkIn: '2026-08-15',
                    checkOut: '2026-08-20',
                    adults: 4,
                    children: 0,
                    message: 'Hola, consulto por disponibilidad para 4 adultos en el apartamento Arrebol.',
                    status: 'read',
                    whatsappSent: false,
                    notes: 'Llamar por la tarde para confirmar',
                    adminNotes: 'Llamar por la tarde para confirmar',
                    createdAt: Timestamp.fromDate(new Date(Date.now() - 3600000 * 24)),
                    updatedAt: Timestamp.fromDate(new Date(Date.now() - 3600000 * 24))
                }
            ];

            for (const inquiry of sampleInquiries) {
                await addDoc(collection(db, INQUIRIES_COLLECTION), inquiry);
            }
            console.log("Sample inquiries seeded successfully!");
            return true;
        }
        return false;
    } catch (e) {
        console.error("Error seeding inquiries: ", e);
        return false;
    }
};
