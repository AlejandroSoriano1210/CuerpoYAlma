<?php

namespace Database\Seeders;

use App\Models\Guia;
use App\Models\Ejercicio;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GuiaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guias = [
            [
                'titulo' => 'Rutina de Pecho para Principiantes',
                'contenido' => 'Esta rutina está diseñada para principiantes que desean desarrollar fuerza en el pecho.',
                'nivel' => 'principiante',
            ],
            [
                'titulo' => 'Entrenamiento de Espalda Intermedio',
                'contenido' => 'Programa de espalda para usuarios con experiencia previa en entrenamiento.',
                'nivel' => 'intermedio',
            ],
            [
                'titulo' => 'Rutina Completa Full Body',
                'contenido' => 'Entrenamiento de cuerpo completo para máxima eficiencia.',
                'nivel' => 'intermedio',
            ],
            [
                'titulo' => 'Programa de Piernas Avanzado',
                'contenido' => 'Rutina avanzada para desarrollar piernas fuertes y musculosas.',
                'nivel' => 'avanzado',
            ],
            [
                'titulo' => 'Rutina de Brazos Explosivos',
                'contenido' => 'Programa especializado para desarrollo de brazos.',
                'nivel' => 'intermedio',
            ],
        ];

        // Obtener todos los ejercicios
        $ejercicios = Ejercicio::all();

        if ($ejercicios->isEmpty()) {
            $this->command->warn('⚠️ No hay ejercicios. Ejecuta EjercicioSeeder primero.');
            return;
        }

        foreach ($guias as $guiaData) {
            $guia = Guia::create($guiaData);

            // Asignar 5-8 ejercicios aleatorios a cada guía
            $ejerciciosAleatorios = $ejercicios->random(rand(5, 8));
            $orden = 1;

            foreach ($ejerciciosAleatorios as $ejercicio) {
                $guia->guiaEjercicio()->create([
                    'ejercicio_id' => $ejercicio->id,
                    'series' => rand(3, 5),
                    'repeticiones' => rand(8, 15),
                    'instrucciones' => "Ejecutar el ejercicio de forma controlada manteniendo buena postura. Descansar 60-90 segundos entre series.",
                    'orden' => $orden++,
                ]);
            }
        }

        $this->command->info('✅ 5 guías creadas con ejercicios asignados.');
    }
}
