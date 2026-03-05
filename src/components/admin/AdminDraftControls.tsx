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
        alert('Cambios publicados correctamente');
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
            {/* Floating Control Bar */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-4 bg-black/90 text-white p-2 rounded-full shadow-2xl backdrop-blur-md border border-white/20 pl-6 pr-2 animate-fade-in-up">

                <div className="flex items-center gap-3 mr-4">
                    <div className={`w-2 h-2 rounded-full ${hasPendingChanges ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-[10px] font-ui tracking-widest uppercase opacity-80 hidden md:block">
                        {hasPendingChanges ? 'Cambios sin guardar' : 'Modo Edición'}
                    </span>
                </div>

                {/* Preview Toggle */}
                <button
                    onClick={togglePreviewMode}
                    className={`p-3 rounded-full transition-colors ${isPreviewMode ? 'bg-sage text-white' : 'hover:bg-white/10 text-gray-300'}`}
                    title={isPreviewMode ? "Salir de Previsualización" : "Previsualizar"}
                >
                    {isPreviewMode ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                </button>

                <div className="w-px h-6 bg-white/20 mx-1"></div>

                {/* Confirm Button */}
                <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!hasPendingChanges}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${hasPendingChanges
                            ? 'bg-sage text-white hover:scale-110 shadow-[0_0_15px_rgba(144,198,158,0.5)]'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                    title="Publicar Cambios"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </button>

                {/* Discard / Exit Button */}
                <button
                    onClick={() => {
                        if (hasPendingChanges) setShowDiscardModal(true);
                        else handleExit();
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-500/20 hover:text-red-400 text-gray-300 transition-colors"
                    title={hasPendingChanges ? "Descartar Cambios" : "Salir"}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
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






