<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Clase;
use App\Models\HorarioClase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservaClaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_puede_reservar_una_clase()
    {
        // Arrange: crear datos de prueba con factories
        $trainer = User::factory()->create();
        $clase   = Clase::factory()->create(['user_id' => $trainer->id]);
        $cliente = User::factory()->create();

        $horario = HorarioClase::factory()->create([
            'clase_id' => $clase->id,
            'user_id'  => $trainer->id,
        ]);

        // Act: simular petición HTTP (ajusta la ruta a tu API real)
        $response = $this
            ->actingAs($cliente)
            ->post('/reservas', [
                'horario_clase_id' => $horario->id,
            ]);

        // Assert: comprobar respuesta y DB
        $response->assertStatus(201);
        $this->assertDatabaseHas('horario_clase_user', [
            'horario_clase_id' => $horario->id,
            'user_id'          => $cliente->id,
            'estado'           => 'pendiente',
        ]);
    }

    public function test_invitado_no_puede_reservar_una_clase()
    {
        $trainer = User::factory()->create();
        $clase   = Clase::factory()->create(['user_id' => $trainer->id]);
        $horario = HorarioClase::factory()->create([
            'clase_id' => $clase->id,
            'user_id'  => $trainer->id,
        ]);

        $response = $this->post('/reservas', [
            'horario_clase_id' => $horario->id,
        ]);

        $response->assertStatus(302); // si usas web + redirect a login
        // o 401/403 si es API pura, según tu middleware
    }
}
