<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioClaseUser extends Model
{
    /** @use HasFactory<\Database\Factories\HorarioClaseUserFactory> */
    use HasFactory;

    protected $table = 'horario_clase_user';

    protected $fillable = [
        'horario_clase_id',
        'user_id',
        'estado',
    ];

    public function horarioClase()
    {
        return $this->belongsTo(HorarioClase::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
