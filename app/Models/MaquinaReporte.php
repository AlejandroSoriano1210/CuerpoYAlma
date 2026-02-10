<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaquinaReporte extends Model
{
    use HasFactory;

    protected $table = 'maquina_reportes';

    protected $fillable = [
        'maquina_id',
        'tecnico_id',
        'estado_anterior',
        'tiempo_reparacion',
        'unidad_tiempo',
        'coste_reparacion',
        'notas',
    ];

    protected $casts = [
        'coste_reparacion' => 'decimal:2',
    ];

    public function maquina()
    {
        return $this->belongsTo(Maquina::class);
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    /**
     * Obtener el tiempo de reparación formateado
     */
    public function getTiempoFormateadoAttribute()
    {
        $unidad = match ($this->unidad_tiempo) {
            'minutos' => $this->tiempo_reparacion === 1 ? 'minuto' : 'minutos',
            'horas' => $this->tiempo_reparacion === 1 ? 'hora' : 'horas',
            'dias' => $this->tiempo_reparacion === 1 ? 'día' : 'días',
            default => $this->unidad_tiempo,
        };

        return "{$this->tiempo_reparacion} {$unidad}";
    }
}
