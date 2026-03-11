'use client';
import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';

const AdminDraftControls: React.FC = () => {
    const {
        isDraftMode,
        hasPendingChanges,
        confirmDraft,
        discardDraft,
        toggleDraftMode,
        isPreviewMode,
        togglePreviewMode
    } = useAdmin();
    const router = useRouter();

    // Local state for confirmation modals
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!isDraftMode) return null;

    const handleConfirm = async () => {
        setIsSaving(true);
        await confirmDraft();
        setIsSaving(false);
        setShowConfirmModal(false);
        toggleDraftMode(false);
        router.push('/admin');
    };

    const handleDiscard = () => {
        discardDraft();
        setShowDiscardModal(false);
        // Optional: Exit draft mode? User said "discard changes", but the exit flow is separate or implied.
        // Let's assume we just clear changes.
    };

    const handleExit = () => {
        if (hasPendingChanges) {
            setShowDiscardModal(true); // Ask before exiting if changes exist
        } else {
            toggleDraftMode(false);
            router.push('/admin');
        }
    };

    return (
        <>
            {/* Floating Control Bar - Bottom Left */}
            <div className="fixed bottom-6 left-6 z-[9999] animate-fade-in-up">
                {hasPendingChanges ? (
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        className="flex items-center gap-3 bg-sage text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(144,198,158,0.6)] hover:bg-sage/90 transition-all group"
                        title="Publicar Cambios y Volver al Dashboard"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <span className="text-xs font-bold tracking-widest uppercase">Publicar y Volver</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                ) : (
                    <button
                        onClick={handleExit}
                        className="flex items-center gap-2 bg-black/80 hover:bg-black text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-md transition-all group"
                        title="Volver al Admin"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="text-xs tracking-widest uppercase">Volver al Admin</span>
                    </button>
                )}
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
                        <div className="w-16 h-16 bg-sage/20 text-sage rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="font-script text-3xl mb-2 text-forest">¿Publicar cambios?</h3>
                        <p className="text-gray-500 text-sm mb-6">Esto actualizará el sitio web visible para todos los usuarios. No se puede deshacer automáticamente.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 rounded-full border border-gray-200 text-gray-500 text-xs tracking-widest hover:bg-gray-50 bg-white"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isSaving}
                                className="px-6 py-2 rounded-full bg-forest text-white text-xs tracking-widest hover:bg-forest/90 shadow-lg"
                            >
                                {isSaving ? 'PUBLICANDO...' : 'CONFIRMAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discard Modal */}
            {showDiscardModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="font-script text-3xl mb-2 text-red-500">¿Descartar todo?</h3>
                        <p className="text-gray-500 text-sm mb-6">Se perderán todos los cambios no guardados en esta sesión.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowDiscardModal(false)}
                                className="px-6 py-2 rounded-full border border-gray-200 text-gray-500 text-xs tracking-widest hover:bg-gray-50 bg-white"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleDiscard}
                                className="px-6 py-2 rounded-full bg-red-500 text-white text-xs tracking-widest hover:bg-red-600 shadow-lg"
                            >
                                DESCARTAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDraftControls;






