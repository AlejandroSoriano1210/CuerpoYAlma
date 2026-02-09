<?php

namespace Database\Seeders;

use App\Models\NotificacionProgramada;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class NotificacionProgramadaSeeder extends Seeder
{
    public function run(): void
    {
        $super = User::whereHas('roles', fn($q) => $q->where('name', 'superusuario'))->first();

        if (!$super) {
            $this->command->warn('No se encontró superusuario. Saltando seeder de notificaciones programadas.');
            return;
        }

        $ahora = Carbon::now();

        $notificaciones = [
            // 1. Recordatorio mensual de mediciones (recurrente, reemplaza al antiguo comando)
            [
                'titulo' => 'Recordatorio mensual de mediciones',
                'mensaje' => '¡Es hora de actualizar tus métricas corporales! Registra tus medidas del mes para ver tu progreso en las gráficas.',
                'url' => '/estadisticas',
                'destinatarios' => 'clientes',
                'usuario_id' => null,
                'tipo_envio' => 'recurrente',
                'frecuencia' => 'mensual',
                'dia_semana' => null,
                'dia_mes' => 1,
                'hora_envio' => '08:00',
                'fecha_envio' => null,
                'activa' => true,
                'ultima_ejecucion' => $ahora->copy()->subMonth(),
                'proxima_ejecucion' => $ahora->copy()->startOfMonth()->addMonth()->setTime(8, 0),
            ],

            // 2. Recordatorio semanal de clases (recurrente)
            [
                'titulo' => 'Nuevas clases disponibles esta semana',
                'mensaje' => '¡Ya están disponibles las clases de esta semana! Reserva tu plaza antes de que se llenen.',
                'url' => '/clases',
                'destinatarios' => 'clientes',
                'usuario_id' => null,
                'tipo_envio' => 'recurrente',
                'frecuencia' => 'semanal',
                'dia_semana' => 1,
                'dia_mes' => null,
                'hora_envio' => '09:00',
                'fecha_envio' => null,
                'activa' => true,
                'ultima_ejecucion' => $ahora->copy()->subWeek(),
                'proxima_ejecucion' => $ahora->copy()->next('Monday')->setTime(9, 0),
            ],

            // 3. Aviso de mantenimiento programado (una sola vez, futuro)
            [
                'titulo' => 'Mantenimiento programado del gimnasio',
                'mensaje' => 'El sábado 14 de febrero realizaremos tareas de mantenimiento de 8:00 a 12:00. Disculpa las molestias.',
                'url' => null,
                'destinatarios' => 'todos',
                'usuario_id' => null,
                'tipo_envio' => 'unica_vez',
                'frecuencia' => null,
                'dia_semana' => null,
                'dia_mes' => null,
                'hora_envio' => '10:00',
                'fecha_envio' => $ahora->copy()->addDays(5)->format('Y-m-d'),
                'activa' => true,
                'ultima_ejecucion' => null,
                'proxima_ejecucion' => $ahora->copy()->addDays(5)->setTime(10, 0),
            ],

            // 4. Reunión de equipo para empleados (recurrente mensual)
            [
                'titulo' => 'Reunión mensual de equipo',
                'mensaje' => 'Recuerda que el próximo día 15 tenemos reunión de equipo a las 14:00. ¡Tu asistencia es importante!',
                'url' => null,
                'destinatarios' => 'empleados',
                'usuario_id' => null,
                'tipo_envio' => 'recurrente',
                'frecuencia' => 'mensual',
                'dia_semana' => null,
                'dia_mes' => 14,
                'hora_envio' => '10:00',
                'fecha_envio' => null,
                'activa' => true,
                'ultima_ejecucion' => $ahora->copy()->subMonth(),
                'proxima_ejecucion' => $ahora->copy()->day(14)->setTime(10, 0)->isFuture()
                    ? $ahora->copy()->day(14)->setTime(10, 0)
                    : $ahora->copy()->addMonth()->day(14)->setTime(10, 0),
            ],

            // 5. Motivación diaria para entrenadores (recurrente diaria)
            [
                'titulo' => 'Motivación diaria',
                'mensaje' => '¡Buenos días, equipo! Hoy es un gran día para motivar a nuestros clientes. ¡Vamos con todo!',
                'url' => null,
                'destinatarios' => 'entrenadores',
                'usuario_id' => null,
                'tipo_envio' => 'recurrente',
                'frecuencia' => 'diaria',
                'dia_semana' => null,
                'dia_mes' => null,
                'hora_envio' => '07:30',
                'fecha_envio' => null,
                'activa' => true,
                'ultima_ejecucion' => $ahora->copy()->subDay(),
                'proxima_ejecucion' => $ahora->copy()->addDay()->setTime(7, 30),
            ],

            // 6. Promoción especial (una sola vez, ya enviada/inactiva)
            [
                'titulo' => 'Promoción de Año Nuevo',
                'mensaje' => '¡Feliz año nuevo! Empieza el 2026 con fuerza. Trae a un amigo este mes y ambos tendréis un 20% de descuento.',
                'url' => null,
                'destinatarios' => 'clientes',
                'usuario_id' => null,
                'tipo_envio' => 'unica_vez',
                'frecuencia' => null,
                'dia_semana' => null,
                'dia_mes' => null,
                'hora_envio' => '10:00',
                'fecha_envio' => '2026-01-02',
                'activa' => false,
                'ultima_ejecucion' => Carbon::parse('2026-01-02 10:00:00'),
                'proxima_ejecucion' => null,
            ],

            // 7. Recordatorio de limpieza para equipo limpieza (recurrente semanal)
            [
                'titulo' => 'Revisión semanal de limpieza',
                'mensaje' => 'Recuerda revisar y reponer los productos de limpieza antes del fin de semana. Reporta lo que haga falta.',
                'url' => null,
                'destinatarios' => 'limpieza',
                'usuario_id' => null,
                'tipo_envio' => 'recurrente',
                'frecuencia' => 'semanal',
                'dia_semana' => 5,
                'dia_mes' => null,
                'hora_envio' => '08:00',
                'fecha_envio' => null,
                'activa' => true,
                'ultima_ejecucion' => $ahora->copy()->subWeek(),
                'proxima_ejecucion' => $ahora->copy()->next('Friday')->setTime(8, 0),
            ],

            // 8. Revisión de maquinaria para técnicos (recurrente semanal)
            [
                'titulo' => 'Revisión semanal de maquinaria',
                'mensaje' => 'Toca revisión rutinaria de todas las máquinas. Por favor, actualiza el estado de cada una en el sistema.',
                'url' => '/maquinas',
                'destinatarios' => 'tecnicos',
                'usuario_id' => null,
                'tipo_envio' => 'recurrente',
                'frecuencia' => 'semanal',
                'dia_semana' => 3,
                'dia_mes' => null,
                'hora_envio' => '09:00',
                'fecha_envio' => null,
                'activa' => true,
                'ultima_ejecucion' => $ahora->copy()->subWeek(),
                'proxima_ejecucion' => $ahora->copy()->next('Wednesday')->setTime(9, 0),
            ],
        ];

        foreach ($notificaciones as $data) {
            NotificacionProgramada::create([
                ...$data,
                'created_by' => $super->id,
            ]);
        }

        $this->command->info('✅ ' . count($notificaciones) . ' notificaciones programadas creadas.');
    }
}
