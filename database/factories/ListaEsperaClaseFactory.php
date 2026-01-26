<?php

namespace Database\Factories;

use App\Models\HorarioClase;
use App\Models\ListaEsperaClase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ListaEsperaClase>
 */
class ListaEsperaClaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'horario_clase_id' => HorarioClase::factory(),
            'user_id' => User::factory(),
            'posicion' => $this->faker->numberBetween(1, 10),
        ];
    }
}
