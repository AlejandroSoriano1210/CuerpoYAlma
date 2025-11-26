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

    public function entrenador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function claseEjercicios()
    {
        return $this->hasMany(ClaseEjercicio::class);
    }
}
