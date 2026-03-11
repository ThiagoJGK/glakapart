'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-lg bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                
                <h1 className="font-ui text-xl tracking-widest text-forest uppercase font-bold">Algo salió mal</h1>
                
                <p className="text-gray-500 text-sm leading-relaxed">
                    Tuvimos un problema técnico inesperado. Por favor intenta recargar la página.
                </p>
                
                <div className="p-4 bg-gray-50 rounded-lg text-left overflow-x-auto text-[10px] font-mono text-gray-400">
                    {error.message || "Error interno del servidor."}
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => reset()}
                        className="flex items-center gap-2 bg-sage text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-forest transition-colors shadow-sm w-full sm:w-auto justify-center"
                    >
                        <RefreshCw size={14} /> REINTENTAR
                    </button>
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 border border-gray-200 text-gray-500 px-6 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
                    >
                        VOLVER AL INICIO
                    </Link>
                </div>
            </div>
        </div>
    );
}
