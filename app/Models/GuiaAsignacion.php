<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuiaAsignacion extends Model
{
    use HasFactory;

    protected $table = 'guia_asignaciones';

    protected $fillable = [
        'user_id',
        'guia_id',
        'frecuencia',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guia()
    {
        return $this->belongsTo(Guia::class);
    }
}
