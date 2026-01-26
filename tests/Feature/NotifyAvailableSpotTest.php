<?php

use App\Models\HorarioClase;
use App\Models\HorarioClaseUser;
use App\Models\User;
use App\Notifications\SimpleNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $this->artisan('migrate');
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
});

it('notifies clientes when spot freed from full class', function () {
    Notification::fake();

    $teacher = User::factory()->create();
    $horario = HorarioClase::factory()->create([
        'user_id' => $teacher->id,
        'capacidad' => 1,
        'nombre' => 'Clase X',
        'fecha' => now()->addDays(2),
    ]);

    $user1 = User::factory()->create();
    $user1->assignRole('cliente');

    $user2 = User::factory()->create();
    $user2->assignRole('cliente');

    // user2 se añade a la lista de espera porque la clase está completa
    \App\Models\ListaEsperaClase::agregarALista($horario->id, $user2->id);

    $reserva = HorarioClaseUser::create([
        'horario_clase_id' => $horario->id,
        'user_id' => $user1->id,
        'estado' => 'confirmado',
    ]);

    // user1 cancela su reserva
    $this->actingAs($user1)->patch(route('reservas.cancelar', $reserva->id));

    Notification::assertSentTo($user2, SimpleNotification::class);
});
