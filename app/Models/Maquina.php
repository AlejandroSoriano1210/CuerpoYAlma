<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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
        'imagen_path',
    ];

    protected $appends = [
        'imagen_url',
    ];

    public function getImagenUrlAttribute()
    {
        return $this->imagen_path ? Storage::url($this->imagen_path) : null;
    }
}
