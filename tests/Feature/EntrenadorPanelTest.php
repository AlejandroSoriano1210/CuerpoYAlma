<?php

namespace Tests\Feature;

use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\HorarioClaseUser;
use App\Models\ListaEsperaClase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EntrenadorPanelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear roles necesarios para los tests
        Role::create(['name' => 'entrenador']);
        Role::create(['name' => 'cliente']);
        Role::create(['name' => 'superusuario']);
    }

    public function test_entrenador_puede_ver_su_panel()
    {
        $entrenador = User::factory()->create();
        $entrenador->assignRole('entrenador');

        $response = $this
            ->actingAs($entrenador)
            ->get(route('panel.clases.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Entrenador/Index'));
    }

    public function test_entrenador_ve_solo_sus_clases()
    {
        $entrenador1 = User::factory()->create();
        $entrenador2 = User::factory()->create();
        $entrenador1->assignRole('entrenador');
        $entrenador2->assignRole('entrenador');

        // Crear clase para entrenador 1 (con fecha en mes actual)
        $clase1 = HorarioClase::factory()->create([
            'user_id' => $entrenador1->id,
            'fecha' => now()->format('Y-m-15'), // Día 15 del mes actual
        ]);

        // Crear clase para entrenador 2
        $clase2 = HorarioClase::factory()->create(['user_id' => $entrenador2->id]);

        // Entrenador 1 ve solo su clase
        $response = $this
            ->actingAs($entrenador1)
            ->get(route('panel.clases.index'));

        $response->assertInertia(
            fn ($page) => $page->has('clases', 1)
        );
    }

    public function test_entrenador_puede_ver_detalles_de_su_clase()
    {
        $entrenador = User::factory()->create();
        $entrenador->assignRole('entrenador');

        $clase = HorarioClase::factory()->create(['user_id' => $entrenador->id]);

        $response = $this
            ->actingAs($entrenador)
            ->get(route('panel.clases.show', $clase));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Entrenador/Show'));
    }

    public function test_entrenador_no_puede_ver_clase_de_otro()
    {
        $entrenador1 = User::factory()->create();
        $entrenador2 = User::factory()->create();
        $entrenador1->assignRole('entrenador');
        $entrenador2->assignRole('entrenador');

        $clase = HorarioClase::factory()->create(['user_id' => $entrenador2->id]);

        $response = $this
            ->actingAs($entrenador1)
            ->get(route('panel.clases.show', $clase));

        $response->assertStatus(403);
    }

    public function test_entrenador_puede_promover_usuario_de_lista_espera()
    {
        $entrenador = User::factory()->create();
        $cliente1 = User::factory()->create();
        $cliente2 = User::factory()->create();
        $entrenador->assignRole('entrenador');

        $clase = HorarioClase::factory()->create([
            'user_id' => $entrenador->id,
            'capacidad' => 2, // Capacidad suficiente
        ]);

        // Cliente 1 inscrito
        HorarioClaseUser::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $cliente1->id,
            'estado' => 'confirmado',
        ]);

        // Cliente 2 en lista de espera
        $listaEspera = ListaEsperaClase::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $cliente2->id,
            'posicion' => 1,
        ]);

        // Entrenador promueve cliente 2
        $response = $this
            ->actingAs($entrenador)
            ->patch(route('panel.promover', [
                'horarioClase' => $clase,
                'listaEspera' => $listaEspera,
            ]));

        $response->assertStatus(200);

        // Verificar que cliente 2 está ahora inscrito
        $this->assertDatabaseHas('horario_clase_user', [
            'horario_clase_id' => $clase->id,
            'user_id' => $cliente2->id,
        ]);

        // Verificar que cliente 2 ya no está en lista de espera
        $this->assertDatabaseMissing('lista_espera_clases', [
            'horario_clase_id' => $clase->id,
            'user_id' => $cliente2->id,
        ]);
    }

    public function test_entrenador_no_puede_promover_si_clase_completa()
    {
        $entrenador = User::factory()->create();
        $cliente1 = User::factory()->create();
        $cliente2 = User::factory()->create();
        $entrenador->assignRole('entrenador');

        $clase = HorarioClase::factory()->create([
            'user_id' => $entrenador->id,
            'capacidad' => 1,
        ]);

        // Cliente 1 inscrito
        HorarioClaseUser::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $cliente1->id,
            'estado' => 'confirmado',
        ]);

        // Cliente 2 en lista de espera
        $listaEspera = ListaEsperaClase::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $cliente2->id,
            'posicion' => 1,
        ]);

        // Intentar promover
        $response = $this
            ->actingAs($entrenador)
            ->patch(route('panel.promover', [
                'horarioClase' => $clase,
                'listaEspera' => $listaEspera,
            ]));

        $response->assertStatus(422);
    }

    public function test_entrenador_puede_remover_usuario_de_lista_espera()
    {
        $entrenador = User::factory()->create();
        $cliente = User::factory()->create();
        $entrenador->assignRole('entrenador');

        $clase = HorarioClase::factory()->create(['user_id' => $entrenador->id]);

        $listaEspera = ListaEsperaClase::create([
            'horario_clase_id' => $clase->id,
            'user_id' => $cliente->id,
            'posicion' => 1,
        ]);

        $response = $this
            ->actingAs($entrenador)
            ->delete(route('panel.remover-lista', [
                'horarioClase' => $clase,
                'listaEspera' => $listaEspera,
            ]));

        $response->assertStatus(200);

        $this->assertDatabaseMissing('lista_espera_clases', [
            'id' => $listaEspera->id,
        ]);
    }

    public function test_cliente_no_puede_acceder_al_panel()
    {
        $cliente = User::factory()->create();
        $cliente->assignRole('cliente');

        $response = $this
            ->actingAs($cliente)
            ->get(route('panel.clases.index'));

        $response->assertStatus(403);
    }

    public function test_superusuario_puede_acceder_al_panel()
    {
        $superusuario = User::factory()->create();
        $superusuario->assignRole('superusuario');

        $entrenador = User::factory()->create();
        $entrenador->assignRole('entrenador');

        // El superusuario crea una clase a nombre del entrenador
        $clase = HorarioClase::factory()->create(['user_id' => $superusuario->id]);

        $response = $this
            ->actingAs($superusuario)
            ->get(route('panel.clases.show', $clase));

        // Superusuario tiene acceso al rol de entrenador
        $response->assertStatus(200);
    }
}
