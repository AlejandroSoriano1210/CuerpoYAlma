<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, SoftDeletes;

    // Estados disponibles para empleados
    const ESTADO_DISPONIBLE = 'disponible';
    const ESTADO_BAJA = 'baja';
    const ESTADO_VACACIONES = 'vacaciones';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'telefono',
        'dni',
        'direccion',
        'peso_kg',
        'altura_cm',
        'grasa_corporal_pct',
        'imc',
        'ultimo_pago_mes',
        'ultimo_pago_ano',
        'estado_empleado',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function clases()
    {
        return $this->hasMany(Clase::class);
    }

    public function clasesReservadas()
    {
        return $this->belongsToMany(HorarioClase::class, 'horario_clase_user')
            ->withPivot('estado')
            ->withTimestamps();
    }

    public function listaEspera()
    {
        return $this->hasMany(ListaEsperaClase::class);
    }

    public function horariosClases()
    {
        return $this->hasMany(HorarioClase::class, 'user_id');
    }

    public function horarioTrabajo()
    {
        return $this->hasMany(HorarioTrabajo::class, 'user_id');
    }

    public function measurements()
    {
        return $this->hasMany(UserMeasurement::class);
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }

    public function guiaProgreso()
    {
        return $this->hasMany(GuiaProgreso::class);
    }

    /**
     * Obtener la última medición del cliente
     */
    public function ultimaMedicion()
    {
        return $this->measurements()->latest('fecha_medicion')->first();
    }

    /**
     * Obtener las mediciones de los últimos 30 días para gráficos
     */
    public function medicionesUltimos30Dias()
    {
        return $this->measurements()
            ->where('fecha_medicion', '>=', now()->subDays(30))
            ->orderBy('fecha_medicion', 'asc')
            ->get();
    }
}
