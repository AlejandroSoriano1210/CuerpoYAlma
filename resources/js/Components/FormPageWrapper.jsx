import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackLink from './BackLink';
import FlashMessage from './FlashMessage';

/**
 * FormPageWrapper - Contenedor para páginas de formularios (Create/Edit)
 *
 * @param {string} title - Título de la página (para Head y h1)
 * @param {string} backHref - URL para el enlace de volver
 * @param {string} backText - Texto del enlace de volver
 * @param {string} maxWidth - Ancho máximo: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" (default: "md")
 * @param {ReactNode} children - Contenido del formulario
 */
export default function FormPageWrapper({
    title,
    backHref,
    backText = 'Volver',
    maxWidth = 'md',
    children,
}) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
    };

    return (
        <AuthenticatedLayout>
            <Head title={title} />

            <div className="py-12">
                <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`}>
                    <div className="bg-white shadow rounded-lg p-6">
                        {backHref && <BackLink href={backHref} text={backText} />}

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">{title}</h1>

                        <FlashMessage />

                        {children}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
