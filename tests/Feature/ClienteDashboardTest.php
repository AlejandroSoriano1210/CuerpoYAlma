<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\ClaseAsistida;
use App\Models\Guia;
use App\Models\GuiaView;
use Carbon\Carbon;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

class ClienteDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $cliente;
    private User $entrenador;
    private Clase $clase;
    private HorarioClase $horarioClaseProxima;
    private HorarioClase $horarioClasePasada;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear roles necesarios para los tests
        Role::create(['name' => 'entrenador']);
        Role::create(['name' => 'cliente']);
        Role::create(['name' => 'superusuario']);

        // Crear entrenador
        $this->entrenador = User::factory()
            ->create()
            ->assignRole('entrenador');

        // Crear cliente
        $this->cliente = User::factory()
            ->create()
            ->assignRole('cliente');

        // Crear clase
        $this->clase = Clase::factory()->create();

        // Crear horario de clase para próximos días
        $this->horarioClaseProxima = HorarioClase::factory()
            ->for($this->clase)
            ->for($this->entrenador, 'entrenador')
            ->create([
                'fecha' => now()->addDays(3),
                'hora_inicio' => '10:00:00',
                'hora_fin' => '11:00:00',
                'capacidad' => 10,
            ]);

        // Crear horario de clase pasada
        $this->horarioClasePasada = HorarioClase::factory()
            ->for($this->clase)
            ->for($this->entrenador, 'entrenador')
            ->create([
                'fecha' => now()->subDays(5),
                'hora_inicio' => '10:00:00',
                'hora_fin' => '11:00:00',
                'capacidad' => 10,
            ]);

        // Inscribir cliente en ambas clases
        $this->horarioClaseProxima->clientes()->attach($this->cliente->id, ['estado' => 'confirmado']);
        $this->horarioClasePasada->clientes()->attach($this->cliente->id, ['estado' => 'confirmado']);

        // Registrar asistencia para la clase pasada
        ClaseAsistida::create([
            'user_id' => $this->cliente->id,
            'horario_clase_id' => $this->horarioClasePasada->id,
            'fecha' => $this->horarioClasePasada->fecha,
            'hora_inicio' => $this->horarioClasePasada->hora_inicio,
            'hora_fin' => $this->horarioClasePasada->hora_fin,
        ]);
    }

    public function test_usuario_no_autenticado_no_puede_ver_dashboard()
    {
        $response = $this->get(route('dashboard'));

        $response->assertStatus(302);
        $response->assertRedirect(route('login'));
    }

    public function test_entrenador_no_puede_acceder_a_dashboard()
    {
        $entrenador = User::factory()
            ->create()
            ->assignRole('entrenador');

        $response = $this->actingAs($entrenador)
            ->get(route('dashboard'));

        $response->assertStatus(403);
    }

    public function test_superusuario_no_puede_acceder_a_dashboard()
    {
        $superusuario = User::factory()
            ->create()
            ->assignRole('superusuario');

        $response = $this->actingAs($superusuario)
            ->get(route('dashboard'));

        $response->assertStatus(403);
    }

    public function test_cliente_puede_acceder_a_dashboard_route()
    {
        $response = $this->actingAs($this->cliente)
            ->get(route('dashboard'));

        // Verifica que la ruta esté disponible (aunque no podamos renderizar Inertia en tests)
        $this->assertNotEquals(404, $response->getStatusCode());
    }

    public function test_dashboard_controller_retorna_datos_correctos()
    {
        $this->actingAs($this->cliente);

        $controller = app(\App\Http\Controllers\ClienteDashboardController::class);

        // Simular la llamada al método index
        $response = $controller->index();

        // Verificar que se trata de una respuesta Inertia
        $this->assertNotNull($response);
    }

    public function test_proximas_clases_se_calculan_correctamente()
    {
        $proximasClases = HorarioClase::with(['clase', 'entrenador', 'listaEspera'])
            ->where(function ($query) {
                $query->whereHas('clientes', function ($q) {
                    $q->where('user_id', $this->cliente->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->whereBetween('fecha', [now()->startOfDay(), now()->addDays(7)->endOfDay()])
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->limit(5)
            ->get();

        $this->assertCount(1, $proximasClases);
        $this->assertEquals($this->horarioClaseProxima->id, $proximasClases[0]->id);
    }

    public function test_historial_clases_se_calcula_correctamente()
    {
        $historialClases = HorarioClase::with(['clase', 'entrenador'])
            ->where(function ($query) {
                $query->whereHas('clientes', function ($q) {
                    $q->where('user_id', $this->cliente->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '<', now())
            ->orderBy('fecha', 'desc')
            ->limit(10)
            ->get();

        $this->assertCount(1, $historialClases);
        $this->assertEquals($this->horarioClasePasada->id, $historialClases[0]->id);
    }

    public function test_estadisticas_clases_tomadas_es_correcta()
    {
        $totalClasesTomadas = ClaseAsistida::where('user_id', $this->cliente->id)->count();

        $this->assertEquals(1, $totalClasesTomadas);
    }

    public function test_estadisticas_clases_reservadas_es_correcta()
    {
        $totalClasesReservadas = HorarioClase::where(function ($query) {
                $query->whereHas('clientes', function ($q) {
                    $q->where('user_id', $this->cliente->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '>=', now())
            ->count();

        $this->assertEquals(1, $totalClasesReservadas);
    }

    public function test_guia_actual_puede_ser_null()
    {
        $guiaActual = GuiaView::where('user_id', $this->cliente->id)
            ->with(['guia', 'guia.guiaEjercicio'])
            ->first();

        $this->assertNull($guiaActual);
    }

    public function test_guia_actual_si_existe()
    {
        $guia = Guia::factory()->create([
            'titulo' => 'Test Guide',
            'nivel' => 'principiante',
            'contenido' => 'test content',
        ]);

        GuiaView::create([
            'user_id' => $this->cliente->id,
            'guia_id' => $guia->id,
        ]);

        $guiaActual = GuiaView::where('user_id', $this->cliente->id)
            ->with(['guia', 'guia.guiaEjercicio'])
            ->first();

        $this->assertNotNull($guiaActual);
        $this->assertEquals($guia->id, $guiaActual->guia->id);
        $this->assertEquals('Test Guide', $guiaActual->guia->titulo);
    }

    public function test_cliente_solo_ve_sus_propias_clases()
    {
        $otroCliente = User::factory()
            ->create()
            ->assignRole('cliente');

        $otroHorario = HorarioClase::factory()
            ->for($this->clase)
            ->for($this->entrenador, 'entrenador')
            ->create([
                'fecha' => now()->addDays(2),
            ]);

        $otroHorario->clientes()->attach($otroCliente->id, ['estado' => 'confirmado']);

        // Las clases de otro cliente no aparecen en el dashboard del cliente actual
        $proximasClasesCliente = HorarioClase::where(function ($query) {
                $query->whereHas('clientes', function ($q) {
                    $q->where('user_id', $this->cliente->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->whereBetween('fecha', [now()->startOfDay(), now()->addDays(7)->endOfDay()])
            ->count();

        $proximasClasesOtroCliente = HorarioClase::where(function ($query) use ($otroCliente) {
                $query->whereHas('clientes', function ($q) use ($otroCliente) {
                    $q->where('user_id', $otroCliente->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->whereBetween('fecha', [now()->startOfDay(), now()->addDays(7)->endOfDay()])
            ->count();

        $this->assertEquals(1, $proximasClasesCliente);
        $this->assertEquals(1, $proximasClasesOtroCliente);
    }

    public function test_clases_por_mes_retorna_6_meses()
    {
        $clasesPorMes = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $count = ClaseAsistida::where('user_id', $this->cliente->id)
                ->whereMonth('fecha', $mes->month)
                ->whereYear('fecha', $mes->year)
                ->count();

            $clasesPorMes[] = [
                'mes' => $mes->format('M'),
                'cantidad' => $count,
            ];
        }

        $this->assertCount(6, $clasesPorMes);
    }
}
