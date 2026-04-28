import React from 'react';
import { useAdmin } from '@/context/AdminContext';
import { ImageOff } from 'lucide-react';

interface MissingImagePlaceholderProps {
    id?: string;
    className?: string;
    label?: string;
}

const MissingImagePlaceholder: React.FC<MissingImagePlaceholderProps> = ({ 
    id = 'Imagen Faltante', 
    className = '', 
    label = 'Falta cargar imagen' 
}) => {
    const { isAdminMode } = useAdmin();

    return (
        <div 
            className={`w-full h-full flex flex-col items-center justify-center bg-gray-100/80 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center min-h-[150px] transition-all duration-300 ${isAdminMode ? 'hover:border-forest/50 hover:bg-gray-100' : ''} ${className}`}
            title={isAdminMode ? `ID de edición: ${id}` : label}
        >
            <ImageOff className="w-8 h-8 text-gray-400 mb-2" strokeWidth={1.5} />
            <span className="font-ui text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</span>
            {isAdminMode && id && (
                <div className="mt-2 bg-white/80 px-3 py-1.5 rounded-md border border-gray-200">
                    <span className="text-[10px] text-gray-400 block mb-0.5">ID para editar:</span>
                    <span className="text-xs text-forest font-mono break-all">{id}</span>
                </div>
            )}
        </div>
    );
};

export default MissingImagePlaceholder;
