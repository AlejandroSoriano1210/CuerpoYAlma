<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\EntrenadorController;
use App\Http\Controllers\HorarioClaseController;
use App\Http\Controllers\HorarioTrabajoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservaClaseController;
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
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/clases', [HorarioClaseController::class, 'index'])->name('clases.index');
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
