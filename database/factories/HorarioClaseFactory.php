<?php

namespace Database\Factories;

use App\Models\Clase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HorarioClase>
 */
class HorarioClaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clase_id' => Clase::factory(),
            'user_id' => User::factory(),
            'fecha' => now()->addDays(fake()->numberBetween(1, 30)),
            'hora_inicio' => '09:00:00',
            'hora_fin' => '10:00:00',
        ];
    }
}
