<?php

namespace Tests\Feature;

use App\Models\HorarioClase;
use App\Models\ListaEsperaClase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListaEsperaClaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_puede_reservarse_en_clase_con_espacio()
    {
        $usuario = User::factory()->create();
        $entrenador = User::factory()->create();

        $clase = HorarioClase::factory()->create([
            'user_id' => $entrenador->id,
            'capacidad' => 2,
        ]);

        $this->actingAs($usuario)
            ->post(route('reservas.store'), [
                'horario_clase_id' => $clase->id,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('horario_clase_user', [
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario->id,
        ]);
    }

    public function test_usuario_se_añade_a_lista_espera_cuando_clase_completa()
    {
        $usuario1 = User::factory()->create();
        $usuario2 = User::factory()->create();
        $usuario3 = User::factory()->create(); // Este irá a lista de espera
        $entrenador = User::factory()->create();

        $clase = HorarioClase::factory()->create([
            'user_id' => $entrenador->id,
            'capacidad' => 2,
        ]);

        // Reservar los 2 espacios
        \App\Models\HorarioClaseUser::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario1->id,
            'estado' => 'confirmado',
        ]);

        \App\Models\HorarioClaseUser::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario2->id,
            'estado' => 'confirmado',
        ]);

        // El tercero intenta reservarse
        $this->actingAs($usuario3)
            ->post(route('reservas.store'), [
                'horario_clase_id' => $clase->id,
            ])
            ->assertSessionHasNoErrors();

        // Debe estar en lista de espera
        $this->assertDatabaseHas('lista_espera_clases', [
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario3->id,
            'posicion' => 1,
        ]);

        // No debe estar en reservas
        $this->assertDatabaseMissing('horario_clase_user', [
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario3->id,
        ]);
    }

    public function test_usuario_se_promueve_automaticamente_cuando_hay_espacio()
    {
        $usuario1 = User::factory()->create();
        $usuario2 = User::factory()->create();
        $usuario3 = User::factory()->create(); // En lista de espera
        $entrenador = User::factory()->create();

        $clase = HorarioClase::factory()->create([
            'user_id' => $entrenador->id,
            'capacidad' => 2,
        ]);

        // Crear reservas
        $reserva1 = \App\Models\HorarioClaseUser::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario1->id,
            'estado' => 'confirmado',
        ]);

        $reserva2 = \App\Models\HorarioClaseUser::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario2->id,
            'estado' => 'confirmado',
        ]);

        // Crear lista de espera
        ListaEsperaClase::agregarALista($clase->id, $usuario3->id);

        // Cancelar la primera reserva
        $this->actingAs($usuario1)
            ->patch(route('reservas.cancelar', $reserva1->id))
            ->assertSessionHasNoErrors();

        // El usuario3 debe haber sido promovido
        $this->assertDatabaseHas('horario_clase_user', [
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario3->id,
        ]);

        // Debe haber sido removido de lista de espera
        $this->assertDatabaseMissing('lista_espera_clases', [
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario3->id,
        ]);
    }

    public function test_posiciones_se_reordenan_correctamente()
    {
        $usuario1 = User::factory()->create();
        $usuario2 = User::factory()->create();
        $usuario3 = User::factory()->create();
        $usuario4 = User::factory()->create();
        $entrenador = User::factory()->create();

        $clase = HorarioClase::factory()->create([
            'user_id' => $entrenador->id,
            'capacidad' => 1,
        ]);

        // Crear reserva y lista de espera
        \App\Models\HorarioClaseUser::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $usuario1->id,
            'estado' => 'confirmado',
        ]);

        ListaEsperaClase::agregarALista($clase->id, $usuario2->id); // Posición 1
        ListaEsperaClase::agregarALista($clase->id, $usuario3->id); // Posición 2
        ListaEsperaClase::agregarALista($clase->id, $usuario4->id); // Posición 3

        // Verificar posiciones iniciales
        $this->assertEquals(1, ListaEsperaClase::where('user_id', $usuario2->id)->first()->posicion);
        $this->assertEquals(2, ListaEsperaClase::where('user_id', $usuario3->id)->first()->posicion);
        $this->assertEquals(3, ListaEsperaClase::where('user_id', $usuario4->id)->first()->posicion);

        // Cancelar el de la lista en posición 1
        ListaEsperaClase::where('user_id', $usuario2->id)->delete();
        ListaEsperaClase::reordenarPosiciones($clase->id);

        // Las posiciones deben haberse reajustado
        $this->assertEquals(1, ListaEsperaClase::where('user_id', $usuario3->id)->first()->posicion);
        $this->assertEquals(2, ListaEsperaClase::where('user_id', $usuario4->id)->first()->posicion);
    }
}
