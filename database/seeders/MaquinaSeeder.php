<?php

namespace Database\Seeders;

use App\Models\Maquina;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MaquinaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $maquinas = [
            ['nombre' => 'Cinta de Correr', 'descripcion' => 'Cinta eléctrica para ejercicio cardiovascular', 'estado' => 'operativa', 'ubicacion' => 'Zona Cardio'],
            ['nombre' => 'Bicicleta Estática', 'descripcion' => 'Bicicleta fija para entrenamiento de piernas', 'estado' => 'operativa', 'ubicacion' => 'Zona Cardio'],
            ['nombre' => 'Elíptica', 'descripcion' => 'Máquina elíptica de bajo impacto', 'estado' => 'operativa', 'ubicacion' => 'Zona Cardio'],
            ['nombre' => 'Press de Banca', 'descripcion' => 'Banco para press con pesas', 'estado' => 'operativa', 'ubicacion' => 'Zona Pecho'],
            ['nombre' => 'Máquina de Remo', 'descripcion' => 'Máquina de remo para espalda', 'estado' => 'operativa', 'ubicacion' => 'Zona Espalda'],
            ['nombre' => 'Prensa de Piernas', 'descripcion' => 'Máquina para trabajo de piernas', 'estado' => 'operativa', 'ubicacion' => 'Zona Piernas'],
            ['nombre' => 'Leg Extension', 'descripcion' => 'Extensión de piernas', 'estado' => 'mantenimiento', 'ubicacion' => 'Zona Piernas'],
            ['nombre' => 'Curl de Bíceps', 'descripcion' => 'Máquina para ejercicio de brazos', 'estado' => 'operativa', 'ubicacion' => 'Zona Brazos'],
            ['nombre' => 'Poleas', 'descripcion' => 'Sistema de poleas para múltiples ejercicios', 'estado' => 'operativa', 'ubicacion' => 'Zona Poleas'],
            ['nombre' => 'Barras Paralelas', 'descripcion' => 'Para ejercicios de peso corporal', 'estado' => 'operativa', 'ubicacion' => 'Zona Ejercicio Corporal'],
        ];

        foreach ($maquinas as $maquina) {
            Maquina::create($maquina);
        }

        $this->command->info('✅ 10 máquinas creadas.');
    }
}
