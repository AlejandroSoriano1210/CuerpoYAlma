<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioClase extends Model
{
    /** @use HasFactory<\Database\Factories\HorarioClaseFactory> */
    use HasFactory;

    protected $table = 'horario_clases';

    protected $fillable = [
        'clase_id',
        'user_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
    ];

    protected $casts = [
        'hora_inicio' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class);
    }

    public function clientes()
    {
        return $this->belongsToMany(User::class,'horario_clase_user','horario_clase_id','user_id')->withPivot('estado')->withTimestamps();
    }

    public function entrenadores()
    {
        return $this->user()->whereHas('roles', function ($query) {
            $query->where('name', 'entrenador');
        });
    }
}
