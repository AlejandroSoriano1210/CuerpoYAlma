<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maquina extends Model
{
    /** @use HasFactory<\Database\Factories\MaquinaFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre',
        'tipo',
        'estado',
        'ubicacion',
    ];
}
