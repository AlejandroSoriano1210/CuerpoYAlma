<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class EjercicioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $colores = ['#16a34a', '#0ea5e9', '#f97316', '#a855f7', '#ef4444', '#14b8a6'];
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

        foreach ($ejercicios as $index => $ejercicio) {
            $color = $colores[$index % count($colores)];
            $slug = str($ejercicio['nombre'])->slug();
            $path = "ejercicios/{$slug}.svg";

            if (!Storage::disk('public')->exists($path)) {
                $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="{$color}" />
  <rect x="40" y="40" width="720" height="520" rx="24" fill="#ffffff" fill-opacity="0.12" />
  <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" font-weight="700">{$ejercicio['nombre']}</text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#e5e7eb">{$ejercicio['musculo_objetivo']}</text>
</svg>
SVG;
                Storage::disk('public')->put($path, $svg);
            }

            Ejercicio::create([
                ...$ejercicio,
                'imagen_path' => $path,
            ]);
        }

        $this->command->info('✅ 12 ejercicios creados.');
    }
}
