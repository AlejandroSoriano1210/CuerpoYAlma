<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClaseEjercicio extends Model
{
    protected $table = 'clase_ejercicios';

    protected $fillable = [
        'clase_id',
        'ejercicio_id',
        'series',
        'repeticiones',
        'notas',
    ];

    public function clase()
    {
        return $this->belongsTo(Clase::class);
    }

    public function ejercicio()
    {
        return $this->belongsTo(Ejercicio::class);
    }
}
