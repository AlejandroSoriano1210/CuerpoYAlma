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
     * Elimina clases cuya fecha asignada ya pasó.
     * Devuelve el número de filas eliminadas.
     */
    public static function eliminarClasesExpiradas(): int
    {
        $instance = new self;
        $table = $instance->getTable();
        $candidates = ['fecha', 'dia', 'fecha_hora', 'fecha_inicio', 'start_at', 'scheduled_at'];
        $colFound = null;

        foreach ($candidates as $col) {
            if (Schema::hasColumn($table, $col)) {
                $colFound = $col;
                break;
            }
        }

        if (!$colFound) {
            Log::warning("HorarioClase::eliminarClasesExpiradas - no se encontró columna de fecha en la tabla {$table}");
            return 0;
        }

        $today = Carbon::today()->toDateString();
        $query = self::whereDate($colFound, '<', $today);
        $count = $query->count();

        if ($count > 0) {
            $query->delete();
        }

        return $count;
    }
}
