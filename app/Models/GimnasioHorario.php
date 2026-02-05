<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GimnasioHorario extends Model
{
    /** @use HasFactory<\Database\Factories\GimnasioHorarioFactory> */
    use HasFactory;

    protected $fillable = [
        'dia_semana',
        'hora_apertura',
        'hora_cierre',
    ];
}
