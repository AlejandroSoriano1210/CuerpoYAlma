<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuiaEjercicio extends Model
{
    /** @use HasFactory<\Database\Factories\GuiaEjercicioFactory> */
    use HasFactory;

    protected $fillable = [
        'guia_id',
        'ejercicio_id',
        'series',
        'repeticiones',
        'instrucciones',
        'orden',
    ];

    public function guia()
    {
        return $this->belongsTo(Guia::class);
    }

    public function ejercicio()
    {
        return $this->belongsTo(Ejercicio::class);
    }
}
