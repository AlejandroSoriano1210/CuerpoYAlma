<?php

namespace Database\Seeders;

use App\Models\Ejercicio;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EjercicioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ejercicios = [
            ['nombre' => 'Press de Banca', 'descripcion' => 'Ejercicio clásico para el pecho', 'musculo_objetivo' => 'Pecho'],
            ['nombre' => 'Sentadillas', 'descripcion' => 'Ejercicio fundamental para piernas', 'musculo_objetivo' => 'Piernas'],
            ['nombre' => 'Peso Muerto', 'descripcion' => 'Ejercicio completo de espalda y piernas', 'musculo_objetivo' => 'Espalda'],
            ['nombre' => 'Flexiones', 'descripcion' => 'Ejercicio de peso corporal para pecho', 'musculo_objetivo' => 'Pecho'],
            ['nombre' => 'Dominadas', 'descripcion' => 'Ejercicio para espalda y brazos', 'musculo_objetivo' => 'Espalda'],
            ['nombre' => 'Curl de Bíceps', 'descripcion' => 'Aislamiento de bíceps', 'musculo_objetivo' => 'Brazos'],
            ['nombre' => 'Extensión de Tríceps', 'descripcion' => 'Aislamiento de tríceps', 'musculo_objetivo' => 'Brazos'],
            ['nombre' => 'Hombro de Pesa', 'descripcion' => 'Ejercicio para hombros', 'musculo_objetivo' => 'Hombros'],
            ['nombre' => 'Crunch', 'descripcion' => 'Ejercicio para abdominales', 'musculo_objetivo' => 'Abdomen'],
            ['nombre' => 'Leg Press', 'descripcion' => 'Ejercicio de prensa para piernas', 'musculo_objetivo' => 'Piernas'],
            ['nombre' => 'Remo en Máquina', 'descripcion' => 'Ejercicio controlado para espalda', 'musculo_objetivo' => 'Espalda'],
            ['nombre' => 'Aperturas de Pecho', 'descripcion' => 'Aislamiento de pecho', 'musculo_objetivo' => 'Pecho'],
        ];

        foreach ($ejercicios as $ejercicio) {
            Ejercicio::create($ejercicio);
        }

        $this->command->info('✅ 12 ejercicios creados.');
    }
}
