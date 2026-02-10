<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserMeasurement;
use Carbon\Carbon;

class ClienteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clientes = User::factory(10)->create([
            'created_at' => Carbon::create(2025, 1, 1),
            'updated_at' => Carbon::create(2025, 1, 1),
        ]);

        $clientes->each(function ($user) {
            $user->assignRole('cliente');

            // Crear 5 mediciones históricas para cada cliente
            UserMeasurement::factory()->count(5)->create([
                'user_id' => $user->id,
            ]);
        });

        $this->command->info('✅ 10 clientes creados con 5 mediciones cada uno.');
    }
}
