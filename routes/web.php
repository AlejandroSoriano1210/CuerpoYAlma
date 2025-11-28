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
    Route::post('/reservas', [ReservaClaseController::class, 'store']);

    Route::post('/reservas/{reserva}/cancelar', [ReservaClaseController::class, 'cancelar']);
});

Route::middleware('auth')->get('/clases', [ClaseController::class, 'index']);

Route::middleware(['auth', 'role:entrenador'])->group(function () {
    Route::get('/entrenadores/clases', [UserController::class, 'clasesEntrenador']);
    Route::get('/entrenadores/{entrenador}/horario-trabajo', [HorarioTrabajoController::class, 'show']);
});

// Obtener horario semanal del entrenador autenticado
Route::get('/entrenador/horario-trabajo', [HorarioTrabajoController::class, 'index']);
Route::middleware(['auth', 'role:superusuario'])->group(function () {
    Route::get('/entrenadores', [UserController::class, 'index'])->name('entrenadores.index');
    Route::get('/entrenadores/crear', [UserController::class, 'create'])->name('entrenadores.create');
    Route::post('/entrenadores', [UserController::class, 'store'])->name('entrenadores.store');
    Route::get('/entrenadrores/{entrenador}', [UserController::class, 'show'])->name('entrenadores.show');
    Route::get('/entrenadores/{entrenador}/editar', [UserController::class, 'edit'])->name('entrenadores.edit');
    Route::patch('/entrenadores/{entrenador}', [UserController::class, 'update'])->name('entrenadores.update');
    Route::delete('/entrenadores/{entrenador}', [UserController::class, 'destroy'])->name('entrenadores.destroy');
    Route::post('/entrenadores/{entrenador}/horario-trabajo', [HorarioTrabajoController::class, 'store']);
});

Route::middleware(['auth', 'role:superusuario|entrenador'])->group(function () {
    Route::get('/entrenadrores/{entrenador}', [UserController::class, 'show'])->name('entrenadores.show');

});

require __DIR__ . '/auth.php';
