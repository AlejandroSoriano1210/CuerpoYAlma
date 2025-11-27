<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioTrabajo extends Model
{
    /** @use HasFactory<\Database\Factories\HorarioTrabajoFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'dia_semana', 'hora_inicio', 'hora_fin'];

    public function entrenador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
