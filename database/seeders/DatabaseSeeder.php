<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(RoleSeeder::class);

        // Crear clientes de ejemplo
        $this->call(ClienteSeeder::class);

        // Crear mediciones para clientes
        $this->call(UserMeasurementSeeder::class);

        // Crear entrenadores y sus horarios de trabajo
        $this->call(HorarioTrabajoSeeder::class);

        // Crear máquinas
        $this->call(MaquinaSeeder::class);

        // Crear ejercicios
        $this->call(EjercicioSeeder::class);

        // Crear clases
        $this->call(ClaseSeeder::class);

        // Crear guías con ejercicios
        $this->call(GuiaSeeder::class);

        // Crear notificaciones programadas
        $this->call(NotificacionProgramadaSeeder::class);

        $this->command->info('✅ Base de datos poblada exitosamente.');
    }
}
