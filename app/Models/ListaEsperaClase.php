<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListaEsperaClase extends Model
{
    /** @use HasFactory */
    use HasFactory;

    protected $table = 'lista_espera_clases';

    protected $fillable = [
        'horario_clase_id',
        'user_id',
        'posicion',
    ];

    protected $casts = [
        'posicion' => 'integer',
    ];

    public function horarioClase()
    {
        return $this->belongsTo(HorarioClase::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtiene el siguiente usuario en la lista de espera para una clase
     */
    public static function obtenerSiguiente($horarioClaseId)
    {
        return self::where('horario_clase_id', $horarioClaseId)
            ->orderBy('posicion', 'asc')
            ->first();
    }

    /**
     * Añade un usuario a la lista de espera
     */
    public static function agregarALista($horarioClaseId, $userId)
    {
        $ultimaPosicion = self::where('horario_clase_id', $horarioClaseId)
            ->max('posicion') ?? 0;

        return self::create([
            'horario_clase_id' => $horarioClaseId,
            'user_id' => $userId,
            'posicion' => $ultimaPosicion + 1,
        ]);
    }

    /**
     * Reordena las posiciones después de remover un registro
     */
    public static function reordenarPosiciones($horarioClaseId)
    {
        $registros = self::where('horario_clase_id', $horarioClaseId)
            ->orderBy('posicion', 'asc')
            ->get();

        foreach ($registros as $index => $registro) {
            $registro->update(['posicion' => $index + 1]);
        }
    }
}
