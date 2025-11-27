<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Clase;
use App\Models\HorarioClase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListarClasesTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_autenticado_ve_clases_con_horarios()
    {
        $trainer = User::factory()->create();
        $cliente = User::factory()->create();

        $clase = Clase::factory()->create([
            'user_id' => $trainer->id,
        ]);

        $horario = HorarioClase::factory()->create([
            'clase_id' => $clase->id,
            'user_id'  => $trainer->id,
        ]);

        $response = $this
            ->actingAs($cliente)
            ->get('/clases'); // ajusta a tu ruta real

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id'     => $clase->id,
            'nombre' => $clase->nombre,
        ]);
    }
}
