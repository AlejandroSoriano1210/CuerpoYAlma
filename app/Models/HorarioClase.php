<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioClase extends Model
{
    /** @use HasFactory<\Database\Factories\HorarioClaseFactory> */
    use HasFactory;

    protected $fillable = [
        'clase_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
    ];

    public function clase()
    {
        return $this->belongsTo(Clase::class);
    }

    public function clientes()
    {
        return $this->belongsToMany(User::class, 'horario_clase_user')
                    ->withPivot('estado')
                    ->withTimestamps();
    }

    public function entrenador()
    {
        return $this->user->roles()->where('name', 'entrenador')->first();
    }
}
