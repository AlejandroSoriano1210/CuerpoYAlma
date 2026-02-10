import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function NotificationsIndex({ notifications: initialNotifications, unread }) {
    const [notifications, setNotifications] = useState(initialNotifications || []);

    const markAsRead = async (id) => {
        try {
            await window.axios.post(route("notifications.read", id));
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Head title="Notificaciones" />

            <h2 className="text-2xl font-bold mb-4">Notificaciones</h2>

            <div className="space-y-3">
                {notifications.length === 0 && <div className="text-gray-500">No hay notificaciones</div>}
                {notifications.map((n) => (
                    <div key={n.id} className="p-4 bg-white rounded shadow-sm flex justify-between">
                        <div>
                            <div className="font-medium">{n.data.message}</div>
                            <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!n.read_at ? (
                                <button onClick={() => markAsRead(n.id)} className="text-sm text-blue-600 hover:underline">
                                    Marcar como leído
                                </button>
                            ) : (
                                <span className="text-sm text-gray-400">Leído</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
