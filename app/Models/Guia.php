<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guia extends Model
{
    /** @use HasFactory<\Database\Factories\GuiaFactory> */
    use HasFactory;

    protected $fillable = [
        'titulo',
        'contenido',
        'nivel',
    ];

    public function guiaEjercicio()
    {
        return $this->hasMany(GuiaEjercicio::class);
    }

    public function ejercicios()
    {
        return $this->belongsToMany(Ejercicio::class, 'guia_ejercicios')
            ->withPivot(['id', 'series', 'repeticiones', 'instrucciones', 'orden'])
            ->withTimestamps();
    }
}
