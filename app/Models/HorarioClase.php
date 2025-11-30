<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HorarioClase extends Model
{
    use HasFactory;

    protected $table = 'horario_clases';

    protected $fillable = [
        'user_id',
        'nombre',
        'capacidad',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'descripcion',
    ];

    protected $casts = [
        'fecha' => 'date:Y-m-d',
    ];

    public function entrenador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function clientes()
    {
        return $this->belongsToMany(User::class, 'horario_clase_user')
            ->select('users.id', 'users.name', 'users.email')
            ->withPivot('estado')
            ->withTimestamps();
    }
}
