<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMeasurement extends Model
{
    protected $fillable = ['user_id', 'peso_kg', 'altura_cm', 'grasa_corporal_pct', 'fecha_medicion'];

    protected $casts = [
        'fecha_medicion' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
