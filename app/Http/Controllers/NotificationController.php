<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // If called via AJAX/JSON, return the latest 'limit' notifications
        if ($request->wantsJson() || $request->ajax()) {
            $limit = (int) $request->query('limit', 3);

            $notifications = $user->notifications()->orderBy('created_at', 'desc')
                ->take($limit)->get()->map(function ($n) {
                    return [
                        'id' => $n->id,
                        'type' => class_basename($n->type),
                        'data' => $n->data,
                        'read_at' => $n->read_at,
                        'created_at' => $n->created_at->toDateTimeString(),
                    ];
                });

            return response()->json([
                'notifications' => $notifications,
                'unread' => $user->unreadNotifications()->count(),
                'total' => $user->notifications()->count(),
            ]);
        }

        // Default: render Inertia page with paginated notifications
        $perPage = 15;
        $notifications = $user->notifications()->orderBy('created_at', 'desc')->paginate($perPage);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications->through(function ($n) {
                return [
                    'id' => $n->id,
                    'type' => class_basename($n->type),
                    'data' => $n->data,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at->toDateTimeString(),
                ];
            }),
            'unread' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }
}
