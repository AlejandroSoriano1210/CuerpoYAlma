<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserMeasurement;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Faker\Factory as FakerFactory;

class UserMeasurementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = FakerFactory::create('es_ES');
        $clientes = User::role('cliente')->get();

        foreach ($clientes as $user) {
            $altura = $faker->numberBetween(155, 190);
            $pesoBase = $faker->numberBetween(55, 95);
            $grasaBase = $faker->numberBetween(12, 30);

            $peso = $pesoBase;
            $grasa = $grasaBase;

            for ($i = 11; $i >= 0; $i--) {
                $fecha = Carbon::now()->subMonths($i)->startOfMonth()->addDays($faker->numberBetween(0, 5));

                $peso = max(45, $peso + $faker->randomFloat(1, -1.5, 1.5));
                $grasa = max(5, $grasa + $faker->randomFloat(1, -0.8, 0.8));

                UserMeasurement::create([
                    'user_id' => $user->id,
                    'peso_kg' => round($peso, 1),
                    'altura_cm' => $altura,
                    'grasa_corporal_pct' => round($grasa, 1),
                    'fecha_medicion' => $fecha->toDateString(),
                ]);
            }

            $alturaM = $altura / 100;
            $imc = $alturaM > 0 ? round($peso / ($alturaM * $alturaM), 1) : null;

            $user->update([
                'peso_kg' => round($peso, 1),
                'altura_cm' => $altura,
                'grasa_corporal_pct' => round($grasa, 1),
                'imc' => $imc,
            ]);
        }

        $this->command->info('✅ Mediciones de clientes creadas.');
    }
}
