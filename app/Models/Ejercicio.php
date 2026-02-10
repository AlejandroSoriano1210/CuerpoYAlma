<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Ejercicio extends Model
{
    /** @use HasFactory<\Database\Factories\EjercicioFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'musculo_objetivo',
        'imagen_path',
    ];

    protected $appends = [
        'imagen_url',
    ];

    public function getImagenUrlAttribute()
    {
        return $this->imagen_path ? Storage::url($this->imagen_path) : null;
    }

    public function claseEjercicios()
    {
        return $this->hasMany(ClaseEjercicio::class);
    }

    public function guiaEjercicio()
    {
        return $this->hasMany(GuiaEjercicio::class);
    }
}
