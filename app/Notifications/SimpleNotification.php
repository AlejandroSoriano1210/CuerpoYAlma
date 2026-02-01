<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class SimpleNotification extends Notification
{
    use Queueable;

    public string $message;
    public ?string $url;
    public array $additionalData;

    public function __construct(string $message, ?string $url = null, array $additionalData = [])
    {
        $this->message = $message;
        $this->url = $url;
        $this->additionalData = $additionalData;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return array_merge([
            'message' => $this->message,
            'url' => $this->url,
        ], $this->additionalData);
    }

    // optional: include broadcast representation if later needed
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage(array_merge([
            'message' => $this->message,
            'url' => $this->url,
        ], $this->additionalData));
    }
}
