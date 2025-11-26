<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maquina extends Model
{
    /** @use HasFactory<\Database\Factories\MaquinaFactory> */
    use HasFactory;

    protected $table = 'maquinas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
        'ubicacion',
    ];
}
