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
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Crear roles
        $this->call(RoleSeeder::class);

        // Crear horarios del gimnasio
        $this->call(GimnasioHorarioSeeder::class);

        // Crear clientes
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

        $this->command->info('✅ Base de datos poblada exitosamente.');
    }
}
