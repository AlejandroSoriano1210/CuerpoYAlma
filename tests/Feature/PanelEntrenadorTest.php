<?php

namespace Tests\Feature;

use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\HorarioClaseUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PanelEntrenadorTest extends TestCase
{
    use RefreshDatabase;

    public function test_entrenador_ve_sus_clases_y_clientes()
    {
        // Crear rol entrenador
        $role = Role::create(['name' => 'entrenador']);

        // Crear usuarios
        $trainer = User::factory()->create();
        $otroTrainer = User::factory()->create();
        $cliente = User::factory()->create();

        // Asignar rol al entrenador
        $trainer->assignRole('entrenador');

        // ... resto: crear clases, horarios, reservas ...

        $response = $this
            ->actingAs($trainer)
            ->get('/entrenador/clases');

        $response->assertStatus(200);
    }
}
