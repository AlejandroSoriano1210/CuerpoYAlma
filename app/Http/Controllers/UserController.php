<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function clasesEntrenador(Request $request)
    {
        $user = $request->user(); // ya es entrenador por el middleware

        $clases = $user->clases()
            ->with(['horarios.clientes'])
            ->get();

        return response()->json($clases);
    }
}
