<?php

namespace Tests\Feature;

use App\Models\HorarioTrabajo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HorarioTrabajoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'superusuario']);
        Role::create(['name' => 'entrenador']);
    }

    public function test_superusuario_puede_guardar_un_horario_semanal()
    {
        $superusuario = User::factory()->create();
        $superusuario->assignRole('superusuario');
        $entrenador = User::factory()->create();
        $entrenador->assignRole('entrenador');

        $payload = [
            'semanal' => [
                'lunes' => [
                    ['hora_inicio' => '09:00', 'hora_fin' => '13:00'],
                    ['hora_inicio' => '15:00', 'hora_fin' => '18:00'],
                ],
                'martes' => [
                    ['hora_inicio' => '10:00', 'hora_fin' => '14:00'],
                ],
            ],
        ];

        $response = $this
            ->actingAs($superusuario)
            ->postJson("/entrenadores/{$entrenador->id}/horario-trabajo", $payload);

        $response->assertStatus(200)
            ->assertJson(['status' => 'ok']);

        $this->assertDatabaseHas('horario_trabajos', [
            'user_id'     => $entrenador->id,
            'dia_semana'  => 'lunes',
            'hora_inicio' => '09:00',
            'hora_fin'    => '13:00',
        ]);

        $this->assertDatabaseHas('horario_trabajos', [
            'user_id'     => $entrenador->id,
            'dia_semana'  => 'lunes',
            'hora_inicio' => '15:00',
            'hora_fin'    => '18:00',
        ]);

        $this->assertDatabaseHas('horario_trabajos', [
            'user_id'     => $entrenador->id,
            'dia_semana'  => 'martes',
            'hora_inicio' => '10:00',
            'hora_fin'    => '14:00',
        ]);
    }

    public function test_usuario_sin_rol_superusuario_no_puede_guardar_horario()
    {
        $user = User::factory()->create(); // sin rol
        $entrenador = User::factory()->create();

        $payload = [
            'semanal' => [
                'lunes' => [
                    ['hora_inicio' => '09:00', 'hora_fin' => '13:00'],
                ],
            ],
        ];

        $response = $this
            ->actingAs($user)
            ->postJson("/entrenadores/{$entrenador->id}/horario-trabajo", $payload);

        $response->assertStatus(403);

        $this->assertDatabaseCount('horario_trabajos', 0);
    }

    public function test_entrenador_puede_ver_su_horario_semanal()
    {
        $entrenador = User::factory()->create();
        $entrenador->assignRole('entrenador');

        HorarioTrabajo::create([
            'user_id'     => $entrenador->id,
            'dia_semana'  => 'lunes',
            'hora_inicio' => '09:00',
            'hora_fin'    => '13:00',
        ]);

        $response = $this
            ->actingAs($entrenador)
            ->getJson("/entrenadores/{$entrenador->id}/horario-trabajo");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'semanal' => [
                    'lunes' => [
                        ['id', 'hora_inicio', 'hora_fin'],
                    ],
                ],
            ]);
    }

    public function test_usuario_sin_rol_entrenador_no_puede_ver_horario()
    {
        $user = User::factory()->create();
        $entrenador = User::factory()->create();
        $entrenador->assignRole('entrenador');

        $response = $this
            ->actingAs($user)
            ->getJson("/entrenadores/{$entrenador->id}/horario-trabajo");

        $response->assertStatus(403);
    }
}
