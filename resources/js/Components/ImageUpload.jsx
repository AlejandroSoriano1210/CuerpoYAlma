import React from 'react';
import { Upload, X } from 'lucide-react';

/**
 * Componente reutilizable para subida de imagen con preview
 *
 * @param {string} label - Etiqueta del campo
 * @param {string} currentImageUrl - URL de la imagen actual (para edición)
 * @param {File} newImage - Nueva imagen seleccionada
 * @param {function} onImageChange - Callback cuando cambia la imagen
 * @param {boolean} removeImage - Estado de "quitar imagen"
 * @param {function} onRemoveChange - Callback para toggle de quitar imagen
 * @param {string} error - Mensaje de error
 * @param {string} accept - Tipos de archivo aceptados
 * @param {string} altText - Texto alternativo para la imagen
 */
export default function ImageUpload({
    label = 'Imagen',
    currentImageUrl,
    newImage,
    onImageChange,
    removeImage = false,
    onRemoveChange,
    error,
    accept = 'image/png,image/jpeg,image/webp',
    altText = 'Imagen',
}) {
    const previewUrl = newImage ? URL.createObjectURL(newImage) : null;
    const showCurrentImage = currentImageUrl && !newImage && !removeImage;

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {/* Imagen actual */}
            {showCurrentImage && (
                <div className="relative mb-3">
                    <img
                        src={currentImageUrl}
                        alt={altText}
                        className="h-40 w-full rounded-lg object-cover"
                    />
                </div>
            )}

            {/* Preview de nueva imagen */}
            {previewUrl && (
                <div className="relative mb-3">
                    <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="h-40 w-full rounded-lg object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onImageChange(null)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Checkbox para quitar imagen */}
            {currentImageUrl && onRemoveChange && !newImage && (
                <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={removeImage}
                        onChange={(e) => onRemoveChange(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    Quitar imagen actual
                </label>
            )}

            {/* Input de archivo */}
            <div className="relative">
                <input
                    type="file"
                    accept={accept}
                    onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
