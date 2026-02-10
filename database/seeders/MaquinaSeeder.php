<?php

namespace Database\Seeders;

use App\Models\Maquina;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class MaquinaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $colores = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
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

        foreach ($maquinas as $index => $maquina) {
            $color = $colores[$index % count($colores)];
            $slug = str($maquina['nombre'])->slug();
            $path = "maquinas/{$slug}.svg";

            if (!Storage::disk('public')->exists($path)) {
                $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="{$color}" />
  <rect x="40" y="40" width="720" height="520" rx="24" fill="#ffffff" fill-opacity="0.12" />
  <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" font-weight="700">{$maquina['nombre']}</text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#e5e7eb">{$maquina['ubicacion']}</text>
</svg>
SVG;
                Storage::disk('public')->put($path, $svg);
            }

            Maquina::create([
                ...$maquina,
                'imagen_path' => $path,
            ]);
        }

        $this->command->info('✅ 10 máquinas creadas.');
    }
}
