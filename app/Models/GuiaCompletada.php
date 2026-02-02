<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuiaCompletada extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guia_id',
        'completada_el',
    ];

    protected $casts = [
        'completada_el' => 'datetime',
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
