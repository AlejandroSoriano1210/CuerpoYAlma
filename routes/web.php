<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ClienteDashboardController;
use App\Http\Controllers\ClaseController;
use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\EntrenadorPanelController;
use App\Http\Controllers\HorarioClaseController;
use App\Http\Controllers\HorarioTrabajoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservaClaseController;
use App\Http\Controllers\GuiaController;
use App\Http\Controllers\EjercicioController;
use App\Http\Controllers\MaquinaController;
use App\Http\Controllers\UserMeasurementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/editar', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Estadísticas Cliente (solo para clientes)
Route::middleware(['auth', 'role:cliente'])->group(function () {
    Route::get('/estadisticas', [ClienteDashboardController::class, 'index'])->name('estadisticas');
    Route::post('/estadisticas/medidas', [ClienteDashboardController::class, 'updateMetrics'])->name('estadisticas.medidas');
    Route::post('/mediciones', [UserMeasurementController::class, 'store'])->name('mediciones.store');
});

// Notifications
Route::middleware('auth')->group(function () {
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/delete-read', [\App\Http\Controllers\NotificationController::class, 'deleteRead'])->name('notifications.deleteRead');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead');
    Route::post('/notifications/{id}/aceptar-lista-espera', [\App\Http\Controllers\NotificationController::class, 'aceptarListaEspera'])->name('notifications.aceptarListaEspera');
    Route::post('/notifications/{id}/rechazar-lista-espera', [\App\Http\Controllers\NotificationController::class, 'rechazarListaEspera'])->name('notifications.rechazarListaEspera');
});

Route::middleware('auth')->group(function () {
    Route::get('/clases', [ClaseController::class, 'index'])->name('clases.index');
    Route::middleware('role:superusuario|entrenador')->group(function () {
        Route::get('/clases/crear', [HorarioClaseController::class, 'create'])->name('clases.create');
        Route::post('/clases', [HorarioClaseController::class, 'store'])->name('clases.store');
        Route::get('/clases/{horarioClase}/editar', [HorarioClaseController::class, 'edit'])->name('clases.edit');
        Route::patch('/clases/{horarioClase}', [HorarioClaseController::class, 'update'])->name('clases.update');
        Route::delete('/clases/{horarioClase}', [HorarioClaseController::class, 'destroy'])->name('clases.destroy');
    });
    Route::get('/clases/{horarioClase}', [HorarioClaseController::class, 'show'])->name('clases.show');
    Route::post('/reservas', [ReservaClaseController::class, 'store'])->name('reservas.store');
    Route::patch('/reservas/{reserva}/cancelar', [ReservaClaseController::class, 'cancelar'])->name('reservas.cancelar');
    // Allow POST for legacy tests/clients that use form POST to cancel
    Route::post('/reservas/{reserva}/cancelar', [ReservaClaseController::class, 'cancelar']);

    // Lista de espera
    Route::patch('/lista-espera/{listaEspera}/cancelar', [ReservaClaseController::class, 'cancelarListaEspera'])->name('lista-espera.cancelar');
    Route::post('/lista-espera/{listaEspera}/cancelar', [ReservaClaseController::class, 'cancelarListaEspera']);

    // Promover de lista de espera (solo entrenadores)
    Route::middleware('role:entrenador|superusuario')->group(function () {
        Route::patch('/lista-espera/{listaEspera}/promover', [ReservaClaseController::class, 'promoverDelListaEspera'])->name('lista-espera.promover');
        Route::post('/lista-espera/{listaEspera}/promover', [ReservaClaseController::class, 'promoverDelListaEspera']);
    });

    // Guias de ejercicios
    Route::get('/guias', [GuiaController::class, 'index'])->name('guias.index');

    Route::middleware('role:superusuario|entrenador')->group(function () {
        Route::get('/guias/crear', [GuiaController::class, 'create'])->name('guias.create');
        Route::post('/guias', [GuiaController::class, 'store'])->name('guias.store');
        Route::get('/guias/{guia}/editar', [GuiaController::class, 'edit'])->name('guias.edit');
        Route::patch('/guias/{guia}', [GuiaController::class, 'update'])->name('guias.update');
        Route::delete('/guias/{guia}', [GuiaController::class, 'destroy'])->name('guias.destroy');
        Route::post('/guias/{guia}/assign-to-client', [GuiaController::class, 'assignToClient'])->name('guias.assign-to-client');
    });

    Route::get('/guias/{guia}', [GuiaController::class, 'show'])->name('guias.show');
    Route::get('/guias/{guia}/pdf', [GuiaController::class, 'downloadPdf'])->name('guias.downloadPdf');
    Route::post('/guias/{guia}/assign', [GuiaController::class, 'assign'])->name('guias.assign');
    Route::delete('/guias/{guia}/unassign', [GuiaController::class, 'unassign'])->name('guias.unassign');

    Route::middleware('role:superusuario|entrenador')->group(function () {
        // CRUD de ejercicios (solo para entrenadores y superusuario)
        Route::get('/ejercicios', [EjercicioController::class, 'index'])->name('ejercicios.index');
        Route::get('/ejercicios/crear', [EjercicioController::class, 'create'])->name('ejercicios.create');
        Route::post('/ejercicios', [EjercicioController::class, 'store'])->name('ejercicios.store');
        Route::get('/ejercicios/{ejercicio}/editar', [EjercicioController::class, 'edit'])->name('ejercicios.edit');
        Route::patch('/ejercicios/{ejercicio}', [EjercicioController::class, 'update'])->name('ejercicios.update');
        Route::delete('/ejercicios/{ejercicio}', [EjercicioController::class, 'destroy'])->name('ejercicios.destroy');

        // CRUD de maquinas (solo para entrenadores y superusuario)
        Route::get('/maquinas/crear', [MaquinaController::class, 'create'])->name('maquinas.create');
        Route::post('/maquinas', [MaquinaController::class, 'store'])->name('maquinas.store');
        Route::get('/maquinas/{maquina}/editar', [MaquinaController::class, 'edit'])->name('maquinas.edit');
        Route::patch('/maquinas/{maquina}', [MaquinaController::class, 'update'])->name('maquinas.update');
        // Cambiar estado de la máquina (mantenimiento / fuera_de_servicio / operativa)
        Route::patch('/maquinas/{maquina}/estado', [MaquinaController::class, 'cambiarEstado'])->name('maquinas.estado');
        Route::delete('/maquinas/{maquina}', [MaquinaController::class, 'destroy'])->name('maquinas.destroy');
    });
    Route::get('/ejercicios/{ejercicio}', [EjercicioController::class, 'show'])->name('ejercicios.show');
    Route::get('/maquinas', [MaquinaController::class, 'index'])->name('maquinas.index');
    Route::get('/maquinas/{maquina}', [MaquinaController::class, 'show'])->name('maquinas.show');
    Route::get('/guias/{guia}', [GuiaController::class, 'show'])->name('guias.show');
});

Route::middleware(['auth', 'role:entrenador|superusuario'])->group(function () {
    Route::get('/panel/clases', [EntrenadorPanelController::class, 'index'])->name('panel.clases.index');
    Route::get('/panel/clases/{horarioClase}', [EntrenadorPanelController::class, 'show'])->name('panel.clases.show');
    Route::patch('/panel/clases/{horarioClase}/promover/{listaEspera}', [EntrenadorPanelController::class, 'promover'])->name('panel.promover');
    Route::delete('/panel/clases/{horarioClase}/lista/{listaEspera}', [EntrenadorPanelController::class, 'removerDelista'])->name('panel.remover-lista');
});

Route::middleware(['auth', 'role:entrenador'])->group(function () {
    Route::get('/entrenadores/clases', [EntrenadorController::class, 'clasesEntrenador']);
    Route::get('/entrenadores/{entrenador}/horario-trabajo', [HorarioTrabajoController::class, 'show']);
});

Route::middleware(['auth', 'verified', 'role:superusuario'])->group(function () {
    Route::get('/entrenadores', [EntrenadorController::class, 'index'])->name('entrenadores.index');
    Route::get('/entrenadores/crear', [EntrenadorController::class, 'create'])->name('entrenadores.create');
    Route::post('/entrenadores', [EntrenadorController::class, 'store'])->name('entrenadores.store');
    Route::get('/entrenadores/{entrenador}', [EntrenadorController::class, 'show'])->name('entrenadores.show');
    Route::get('/entrenadores/{entrenador}/editar', [EntrenadorController::class, 'edit'])->name('entrenadores.edit');
    Route::patch('/entrenadores/{entrenador}', [EntrenadorController::class, 'update'])->name('entrenadores.update');
    Route::delete('/entrenadores/{entrenador}', [EntrenadorController::class, 'destroy'])->name('entrenadores.destroy');

    Route::get('/entrenador/horario-trabajo', [HorarioTrabajoController::class, 'index']);
    Route::post('/entrenadores/{entrenador}/horario-trabajo', [HorarioTrabajoController::class, 'store']);

    Route::get('/clientes', [ClienteController::class, 'index'])->name('clientes.index');
    Route::post('/clientes', [ClienteController::class, 'store'])->name('clientes.store');
    Route::get('/clientes/{cliente}', [ClienteController::class, 'show'])->name('clientes.show');
    Route::get('/clientes/{cliente}/editar', [ClienteController::class, 'edit'])->name('clientes.edit');
    Route::patch('/clientes/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
    Route::delete('/clientes/{cliente}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
});

require __DIR__ . '/auth.php';
