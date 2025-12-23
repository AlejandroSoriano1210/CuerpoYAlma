<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile and annual summary.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $year = now()->year;

        // Clases a las que asistió este año: reservas confirmadas (no canceladas) con fecha pasada en este año
        $records = \App\Models\HorarioClaseUser::where('user_id', $user->id)
            ->where('estado', '!=', 'cancelado')
            ->whereHas('horarioClase', function ($q) use ($year) {
                $q->whereYear('fecha', $year)->whereDate('fecha', '<', now());
            })->with('horarioClase')->get();

        $clasesAsistidas = $records->count();

        // Conteo por mes (1-12)
        $clasesPorMes = array_fill(1, 12, 0);
        foreach ($records as $r) {
            if ($r->horarioClase && $r->horarioClase->fecha) {
                $month = (int) $r->horarioClase->fecha->format('n');
                $clasesPorMes[$month]++;
            }
        }

        // Guías utilizadas (vistas) este año
        $guiaViews = \App\Models\GuiaView::with('guia')
            ->where('user_id', $user->id)
            ->whereYear('created_at', $year)
            ->get();

        $resumenAnual = [
            'year' => $year,
            'clases_asistidas' => $clasesAsistidas,
            'clases_por_mes' => array_values($clasesPorMes), // 12 elementos (enero..diciembre)
            'guias_utilizadas' => $guiaViews->count(),
            'guias' => $guiaViews->map(function ($gv) {
                return [
                    'id' => $gv->guia->id,
                    'titulo' => $gv->guia->titulo,
                ];
            })->values(),
        ];

        return Inertia::render('Profile/Show', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'resumenAnual' => $resumenAnual,
            'user' => $user,
        ]);
    }

    /**
     * Display the user's profile form for editing.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.show')->with('status', 'Perfil actualizado correctamente.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
