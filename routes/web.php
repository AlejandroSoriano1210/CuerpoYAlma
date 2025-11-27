<?php

use App\Http\Controllers\ClaseController;
use App\Http\Controllers\HorarioTrabajoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservaClaseController;
use App\Http\Controllers\UserController;
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
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    // Crear reserva (ya lo tienes si seguiste lo anterior)
    Route::post('/reservas', [ReservaClaseController::class, 'store']);

    Route::post('/reservas/{reserva}/cancelar', [ReservaClaseController::class, 'cancelar']);
});

Route::middleware('auth')->get('/clases', [ClaseController::class, 'index']);

Route::middleware(['auth', 'role:entrenador'])->group(function () {
    Route::get('/entrenador/clases', [UserController::class, 'clasesEntrenador']);
});

// Obtener horario semanal del entrenador autenticado
Route::get('/entrenador/horario-trabajo', [HorarioTrabajoController::class, 'index']);
Route::middleware(['auth', 'role:superusuario'])->group(function () {
    Route::post('/entrenador/{entrenador}/horario-trabajo', [HorarioTrabajoController::class, 'store']);
});

require __DIR__ . '/auth.php';
