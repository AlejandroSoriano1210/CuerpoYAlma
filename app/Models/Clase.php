<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clase extends Model
{
    /** @use HasFactory<\Database\Factories\ClaseFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nombre',
        'capacidad',
    ];

    public function horarios()
    {
        return $this->hasMany(HorarioClase::class);
    }
}
