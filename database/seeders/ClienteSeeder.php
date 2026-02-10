<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class ClienteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory(10)->create()->each(function ($user) {
            $user->assignRole('cliente');
        });

        $this->command->info('✅ 10 clientes creados.');
    }
}
