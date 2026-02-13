import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: 'Confirmar acción',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        variant: 'warning',
        resolve: null,
    });

    const closeDialog = useCallback((accepted) => {
        if (dialog.resolve) {
            dialog.resolve(accepted);
        }

        setDialog((prev) => ({
            ...prev,
            isOpen: false,
            resolve: null,
        }));
    }, [dialog]);

    const confirm = useCallback((options) => {
        const config = typeof options === 'string' ? { message: options } : options;

        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                title: config?.title || 'Confirmar acción',
                message: config?.message || '¿Deseas continuar?',
                confirmText: config?.confirmText || 'Confirmar',
                cancelText: config?.cancelText || 'Cancelar',
                variant: config?.variant || 'warning',
                resolve,
            });
        });
    }, []);

    const value = useMemo(() => confirm, [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}

            <ConfirmDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
                variant={dialog.variant}
                onClose={() => closeDialog(false)}
                onConfirm={() => closeDialog(true)}
            />
        </ConfirmContext.Provider>
    );
}

export default function useConfirm() {
    const context = useContext(ConfirmContext);

    if (!context) {
        throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
    }

    return context;
}
