import { Link } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotificationsBell() {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);

    const fetchNotifications = async (limit = 3) => {
        try {
            const { data } = await window.axios.get(route("notifications.index"), {
                params: { limit },
            });
            setNotifications(data.notifications);
            setUnread(data.unread);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await window.axios.post(route("notifications.read", id));
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
            setUnread((u) => Math.max(0, u - 1));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="ms-4">
            <Dropdown>
                <Dropdown.Trigger>
                    <div className="relative">
                        <button className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none">
                            <Bell className="h-5 w-5" />
                            {unread > 0 && (
                                <span className="absolute -top-1 -start-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs w-5 h-5">{unread}</span>
                            )}
                        </button>
                    </div>
                </Dropdown.Trigger>

                <Dropdown.Content align="right" width="64" contentClasses="py-1 bg-white">
                    <div className="p-2">
                        {notifications.length === 0 && (
                            <div className="text-sm text-gray-500">No hay notificaciones</div>
                        )}
                        {notifications.map((n) => (
                            <div key={n.id} className="flex items-start justify-between gap-2 px-2 py-2 hover:bg-gray-50 rounded">
                                <div>
                                    <div className="text-sm text-gray-800">{n.data.message}</div>
                                    <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                                </div>

                                <div className="flex flex-col items-end">
                                    {!n.read_at ? (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Marcar como leído
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400">Leído</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="mt-2 border-t pt-2">
                            <Link href={route("notifications.index")} className="text-sm text-gray-600 hover:underline">
                                Mostrar más
                            </Link>
                        </div>
                    </div>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
}
