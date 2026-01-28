<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class HorarioClase extends Model
{
    use HasFactory;

    protected $table = 'horario_clases';

    protected $fillable = [
        'user_id',
        'clase_id',
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

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'clase_id');
    }

    public function clientes()
    {
        return $this->belongsToMany(User::class, 'horario_clase_user')
            ->select('users.id', 'users.name', 'users.email')
            ->withPivot('estado')
            ->withTimestamps();
    }

    public function listaEspera()
    {
        return $this->hasMany(ListaEsperaClase::class);
    }

    /**
     * Elimina clases cuya fecha y hora de fin ya pasaron.
     * Devuelve el número de filas eliminadas.
     */
    public static function eliminarClasesExpiradas(): int
    {
        $instance = new self;
        $table = $instance->getTable();

        // Verificar que existan las columnas necesarias
        if (!Schema::hasColumn($table, 'fecha') || !Schema::hasColumn($table, 'hora_fin')) {
            Log::warning("HorarioClase::eliminarClasesExpiradas - no se encontraron las columnas 'fecha' u 'hora_fin' en la tabla {$table}");
            return 0;
        }

        // Obtener la fecha y hora actual
        $now = Carbon::now();

        // Eliminar clases donde: fecha < hoy OR (fecha = hoy AND hora_fin <= hora actual)
        $query = self::where(function ($q) use ($now) {
            $q->whereDate('fecha', '<', $now->toDateString())
              ->orWhere(function ($q2) use ($now) {
                  $q2->whereDate('fecha', '=', $now->toDateString())
                     ->where('hora_fin', '<=', $now->toTimeString());
              });
        });

        $count = $query->count();

        if ($count > 0) {
            $query->delete();
        }

        return $count;
    }
}
