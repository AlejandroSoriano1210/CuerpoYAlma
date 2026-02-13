<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\GimnasioHorario;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'telefono' => $request->user()->telefono,
                    'dni' => $request->user()->dni,
                    'direccion' => $request->user()->direccion,
                    'roles' => $request->user()->roles->pluck('name'),
                    'estado_empleado' => $request->user()->estado_empleado,
                ] : null,
            ],
            'gimnasioHorarios' => GimnasioHorario::all(),
        ]);
    }
}

