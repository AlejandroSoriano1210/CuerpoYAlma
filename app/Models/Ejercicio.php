<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ejercicio extends Model
{
    /** @use HasFactory<\Database\Factories\EjercicioFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'musculo_objetivo',
    ];

    public function guias()
    {
        return $this->hasMany(GuiaEjercicio::class);
    }
}
