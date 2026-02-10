<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de roles/permiso (evita errores si se re-seedea)
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Crear permisos base ---
        $permisos = [
            'crear entrenador',
            'editar entrenador',
            'eliminar entrenador',
            'crear clase',
            'editar clase',
            'eliminar clase',
            'crear máquina',
            'editar máquina',
            'eliminar máquina',
            'crear horario clase',
            'editar horario clase',
            'eliminar horario clase',
            'crear horario gimnasio',
            'editar horario gimnasio',
            'eliminar horario gimnasio',
            'crear horario entrenador',
            'editar horario entrenador',
            'eliminar horario entrenador',
            'ver guia'
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        // --- Crear roles ---
        $roles = [
            'superusuario',
            'entrenador',
            'cliente',
        ];

        foreach ($roles as $rol) {
            Role::firstOrCreate(['name' => $rol]);
        }

        // --- Asignar permisos a roles ---
        $superusuario = Role::findByName('superusuario');
        $entrenador = Role::findByName('entrenador');
        $cliente = Role::findByName('cliente');

        $superusuario->syncPermissions(Permission::all());

        $entrenador->syncPermissions([
            'crear clase',
            'editar clase',
            'eliminar clase',
            'crear horario clase',
            'editar horario clase',
            'eliminar horario clase',
        ]);

        $cliente->syncPermissions(['ver guia']);

        // --- Crear el superusuario inicial ---
        $super = User::firstOrCreate(
            ['email' => 'super@demo.com'],
            [
                'name' => 'Super Usuario',
                'password' => Hash::make('password'),
            ]
        );

        // Asignar el rol
        $super->assignRole('superusuario');

        $this->command->info('✅ Superusuario creado: super@demo.com / password');
        $this->command->info('✅ Roles y permisos configurados correctamente.');
    }
}
