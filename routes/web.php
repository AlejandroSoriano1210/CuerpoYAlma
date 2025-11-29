<?php

use App\Http\Controllers\HorarioClaseController;
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
    Route::get('/entrenadores/clases', [UserController::class, 'clasesEntrenador']);
    Route::get('/entrenadores/{entrenador}/horario-trabajo', [HorarioTrabajoController::class, 'show']);
});

Route::middleware(['auth', 'role:superusuario'])->group(function () {
    Route::get('/entrenadores', [UserController::class, 'index'])->name('entrenadores.index');
    Route::get('/entrenadores/crear', [UserController::class, 'create'])->name('entrenadores.create');
    Route::post('/entrenadores', [UserController::class, 'store'])->name('entrenadores.store');
    Route::get('/entrenadores/{entrenador}/editar', [UserController::class, 'edit'])->name('entrenadores.edit');
    Route::patch('/entrenadores/{entrenador}', [UserController::class, 'update'])->name('entrenadores.update');
    Route::delete('/entrenadores/{entrenador}', [UserController::class, 'destroy'])->name('entrenadores.destroy');
    Route::get('/entrenadores/{entrenador}', [UserController::class, 'show'])->name('entrenadores.show');
    Route::get('/entrenador/horario-trabajo', [HorarioTrabajoController::class, 'index']);
    Route::post('/entrenadores/{entrenador}/horario-trabajo', [HorarioTrabajoController::class, 'store']);
});

require __DIR__ . '/auth.php';
