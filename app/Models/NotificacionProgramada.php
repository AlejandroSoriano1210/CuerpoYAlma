<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class NotificacionProgramada extends Model
{
    protected $table = 'notificaciones_programadas';

    protected $fillable = [
        'titulo',
        'mensaje',
        'url',
        'destinatarios',
        'usuario_id',
        'tipo_envio',
        'frecuencia',
        'dia_semana',
        'dia_mes',
        'hora_envio',
        'fecha_envio',
        'ultima_ejecucion',
        'proxima_ejecucion',
        'activa',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
            'fecha_envio' => 'date',
            'ultima_ejecucion' => 'datetime',
            'proxima_ejecucion' => 'datetime',
            'dia_semana' => 'integer',
            'dia_mes' => 'integer',
        ];
    }

    // Relaciones
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function usuarioDestino(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Calcula la próxima ejecución según el tipo y frecuencia.
     */
    public function calcularProximaEjecucion(): ?Carbon
    {
        $ahora = Carbon::now();

        if ($this->tipo_envio === 'unica_vez') {
            if ($this->fecha_envio && $this->hora_envio) {
                $proxima = Carbon::parse($this->fecha_envio->format('Y-m-d') . ' ' . $this->hora_envio);
                return $proxima->isFuture() ? $proxima : null;
            }
            return null;
        }

        // Recurrente
        $hora = Carbon::parse($this->hora_envio);
        $h = $hora->hour;
        $m = $hora->minute;

        switch ($this->frecuencia) {
            case 'diaria':
                $proxima = $ahora->copy()->setTime($h, $m, 0);
                if ($proxima->lte($ahora)) {
                    $proxima->addDay();
                }
                return $proxima;

            case 'semanal':
                $diaTarget = $this->dia_semana ?? 1; // 1=lunes por defecto
                $proxima = $ahora->copy()->next(Carbon::getDays()[$diaTarget % 7])->setTime($h, $m, 0);
                // Si el día de la semana actual es el target y aún no ha pasado la hora
                $hoy = $ahora->copy()->setTime($h, $m, 0);
                if ($ahora->dayOfWeekIso === $diaTarget && $hoy->gt($ahora)) {
                    $proxima = $hoy;
                }
                return $proxima;

            case 'mensual':
                $diaTarget = $this->dia_mes ?? 1;
                $proxima = $ahora->copy()->day(min($diaTarget, $ahora->daysInMonth))->setTime($h, $m, 0);
                if ($proxima->lte($ahora)) {
                    $proxima->addMonth();
                    $proxima->day(min($diaTarget, $proxima->daysInMonth));
                }
                return $proxima;

            case 'anual':
                $diaTarget = $this->dia_mes ?? 1;
                $proxima = $ahora->copy()->month(1)->day($diaTarget)->setTime($h, $m, 0);
                if ($proxima->lte($ahora)) {
                    $proxima->addYear();
                }
                return $proxima;

            default:
                return null;
        }
    }

    /**
     * Scope para notificaciones pendientes de envío.
     */
    public function scopePendientesDeEnvio($query)
    {
        return $query->where('activa', true)
            ->where(function ($q) {
                $q->whereNotNull('proxima_ejecucion')
                    ->where('proxima_ejecucion', '<=', Carbon::now());
            });
    }
}
