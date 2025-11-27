<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\HorarioClaseUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CancelarReservaTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_puede_cancelar_su_reserva()
    {
        $trainer = User::factory()->create();
        $cliente = User::factory()->create();

        $clase = Clase::factory()->create(['user_id' => $trainer->id]);
        $horario = HorarioClase::factory()->create([
            'clase_id' => $clase->id,
            'user_id'  => $trainer->id,
        ]);

        $reserva = HorarioClaseUser::create([
            'horario_clase_id' => $horario->id,
            'user_id'          => $cliente->id,
            'estado'           => 'confirmado',
        ]);

        $response = $this
            ->actingAs($cliente)
            ->post("/reservas/{$reserva->id}/cancelar");

        $response->assertStatus(200);

        $this->assertDatabaseHas('horario_clase_user', [
            'id'      => $reserva->id,
            'estado'  => 'cancelado',
        ]);
    }
}
