<?php

use App\Notifications\SimpleNotification;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

beforeEach(function () {
    $this->artisan('migrate');
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

it('returns latest notifications via api and can mark as read', function () {
    $user = \App\Models\User::factory()->create();

    $user->notify(new SimpleNotification('Mensaje de prueba 1'));
    $user->notify(new SimpleNotification('Mensaje de prueba 2'));

    $this->actingAs($user)
        ->getJson(route('notifications.index', ['limit' => 3]))
        ->assertStatus(200)
        ->assertJson(fn ($json) =>
            $json->where('unread', 2)
                 ->has('notifications')
                 ->etc()
        );

    $payload = $this->actingAs($user)->getJson(route('notifications.index', ['limit' => 1]))->json('notifications')[0];

    $this->actingAs($user)->postJson(route('notifications.read', $payload['id']))->assertStatus(200);

    $this->assertEquals(1, $user->fresh()->unreadNotifications()->count());
});
