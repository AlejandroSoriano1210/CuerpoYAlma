<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuiaProgreso extends Model
{
    /** @use HasFactory<\Database\Factories\GuiaProgresoFactory> */
    use HasFactory;

    protected $table = 'guia_progreso';

    protected $fillable = [
        'user_id',
        'guia_id',
        'guia_ejercicio_id',
        'completado',
    ];

    protected $casts = [
        'completado' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guia()
    {
        return $this->belongsTo(Guia::class);
    }

    public function guiaEjercicio()
    {
        return $this->belongsTo(GuiaEjercicio::class);
    }
}
