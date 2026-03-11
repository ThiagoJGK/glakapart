'use client';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-lg">
                <div className="bg-sage/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <FileQuestion className="w-12 h-12 text-sage animate-pulse" />
                </div>
                
                <h1 className="font-script text-6xl text-forest">Página no encontrada</h1>
                <p className="text-gray-500 font-ui text-lg tracking-widest uppercase">Error 404</p>
                
                <p className="text-gray-600 leading-relaxed text-sm">
                    Lo sentimos, la página que estás buscando no existe o ha sido movida a otro lugar.
                </p>

                <div className="pt-8">
                    <Link 
                        href="/" 
                        className="inline-block bg-forest text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest hover:bg-sage transition-all shadow-md hover:shadow-lg"
                    >
                        VOLVER AL INICIO
                    </Link>
                </div>
            </div>
        </div>
    );
}
