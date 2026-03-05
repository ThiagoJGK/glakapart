'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateContent } from '@/services/content';
import { auth } from '@/services/firebase';
import { onAuthStateChanged, getRedirectResult, GoogleAuthProvider, signOut, User } from 'firebase/auth';

interface AdminContextType {
    isAdmin: boolean;
    isAdminMode: boolean; // Derived: isDraftMode && !isPreviewMode
    isDraftMode: boolean;
    isPreviewMode: boolean;
    authLoading: boolean;
    user: User | null;
    toggleAdmin: () => void;
    toggleDraftMode: (active: boolean) => void;
    togglePreviewMode: () => void;

    // Draft Logic
    pendingChanges: Record<string, string>;
    updateDraft: (id: string, value: string) => void;
    confirmDraft: () => Promise<void>;
    discardDraft: () => void;
    hasPendingChanges: boolean;
}

const AdminContext = createContext<AdminContextType>({
    isAdmin: false,
    isAdminMode: false,
    isDraftMode: false,
    isPreviewMode: false,
    authLoading: true,
    user: null,
    toggleAdmin: () => { },
    toggleDraftMode: () => { },
    togglePreviewMode: () => { },
    pendingChanges: {},
    updateDraft: () => { },
    confirmDraft: async () => { },
    discardDraft: () => { },
    hasPendingChanges: false,
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Firebase Auth state
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        // Handle redirect result (sign out unauthorized users)
        getRedirectResult(auth).then(async (result) => {
            if (result) {
                const email = result.user.email?.toLowerCase() || '';
                const ALLOWED = ['thiagojgk@gmail.com', 'adrigglak@gmail.com', 'apartglak@gmail.com'];
                if (!ALLOWED.includes(email)) {
                    await signOut(auth);
                }
            }
        }).catch(() => { });

        return () => unsubscribe();
    }, []);

    // isAdmin is derived from Firebase Auth
    const isAdmin = !!user;

    // isDraftMode: The new "Editing Session"
    const [isDraftMode, setIsDraftMode] = useState(false);

    // isPreviewMode: To view the site cleanly while in Draft Mode
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Pending changes in memory: { "id": "new value" }
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});

    const toggleAdmin = () => {
        // Legacy support
        setIsDraftMode(!isDraftMode);
    };

    const toggleDraftMode = (active: boolean) => {
        setIsDraftMode(active);
        if (!active) {
            setPendingChanges({});
            setIsPreviewMode(false);
        }
    };

    const togglePreviewMode = () => {
        setIsPreviewMode(prev => !prev);
    };

    const updateDraft = (id: string, value: string) => {
        setPendingChanges(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const confirmDraft = async () => {
        try {
            const promises = Object.entries(pendingChanges).map(async ([fullId, value]) => {
                const parts = fullId.split('.');
                const section = parts[0] || 'general';
                const key = parts.slice(1).join('.');

                await updateContent(section, key, value);
            });

            await Promise.all(promises);
            setPendingChanges({});

            // Dispatch event for components listening to DB updates
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));

        } catch (e) {
            console.error("Error saving draft", e);
            alert("Error al guardar cambios");
        }
    };

    const discardDraft = () => {
        setPendingChanges({});
    };

    return (
        <AdminContext.Provider value={{
            isAdmin,
            isAdminMode: isDraftMode && !isPreviewMode,
            isDraftMode,
            isPreviewMode,
            authLoading,
            user,
            toggleAdmin,
            toggleDraftMode,
            togglePreviewMode,
            pendingChanges,
            updateDraft,
            confirmDraft,
            discardDraft,
            hasPendingChanges: Object.keys(pendingChanges).length > 0
        }}>
            {children}
        </AdminContext.Provider>
    );
};


