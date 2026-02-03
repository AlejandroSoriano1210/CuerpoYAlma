<?php

namespace Database\Factories;

use App\Models\UserMeasurement;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class UserMeasurementFactory extends Factory
{
    protected $model = UserMeasurement::class;

    public function definition(): array
    {
        return [
            'peso_kg' => $this->faker->randomFloat(1, 50, 120),
            'altura_cm' => $this->faker->numberBetween(150, 200),
            'grasa_corporal_pct' => $this->faker->randomFloat(1, 10, 40),
            'fecha_medicion' => Carbon::now()->subDays($this->faker->numberBetween(1, 365)),
        ];
    }
}
