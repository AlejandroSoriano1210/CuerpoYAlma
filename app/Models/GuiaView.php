<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuiaView extends Model
{
    use HasFactory;

    protected $table = 'guia_views';

    protected $fillable = [
        'user_id',
        'guia_id',
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
