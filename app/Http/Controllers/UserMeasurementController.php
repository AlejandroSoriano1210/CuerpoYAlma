<?php

namespace App\Http\Controllers;

use App\Models\UserMeasurement;
use Illuminate\Http\Request;

class UserMeasurementController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'peso_kg' => 'nullable|numeric|min:1|max:500',
            'altura_cm' => 'nullable|numeric|min:50|max:260',
            'grasa_corporal_pct' => 'nullable|numeric|min:0|max:80',
        ]);

        $user = auth()->user();

        UserMeasurement::create([
            'user_id' => $user->id,
            'peso_kg' => $validated['peso_kg'] ?? null,
            'altura_cm' => $validated['altura_cm'] ?? null,
            'grasa_corporal_pct' => $validated['grasa_corporal_pct'] ?? null,
            'fecha_medicion' => now()->toDateString(),
        ]);

        return redirect()
            ->route('estadisticas')
            ->with('success', 'Medición registrada correctamente.');
    }
}
