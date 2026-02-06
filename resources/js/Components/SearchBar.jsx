import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function SearchBar({ initialSearch = '', routeName, preserveScroll = true, extraParams = {} }) {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const debounceTimer = useRef(null);
    const inputRef = useRef(null);

    // Establecer el focus cuando se recarga la página con resultados de búsqueda
    useEffect(() => {
        if (searchTerm && inputRef.current) {
            inputRef.current.focus();
        }
    }, [searchTerm]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Limpiar el timer anterior
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Establecer un nuevo timer
        debounceTimer.current = setTimeout(() => {
            const params = { ...extraParams };

            if (value.trim() !== '') {
                params.search = value;
            }

            router.get(route(routeName), params, { preserveScroll });
        }, 500);
    };

    const clearSearch = () => {
        setSearchTerm('');
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        router.get(route(routeName), { ...extraParams }, { preserveScroll });
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 pl-10 pr-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            {searchTerm && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}
