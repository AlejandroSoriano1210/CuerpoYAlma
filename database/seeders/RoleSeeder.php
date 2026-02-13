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
            'jefe_entrenadores',
            'tecnico',
            'jefe_tecnicos',
            'limpieza',
            'jefe_limpieza',
            'cliente',
        ];

        foreach ($roles as $rol) {
            Role::firstOrCreate(['name' => $rol]);
        }

        // --- Asignar permisos a roles ---
        $superusuario = Role::findByName('superusuario');
        $entrenador = Role::findByName('entrenador');
        $jefeEntrenadores = Role::findByName('jefe_entrenadores');
        $tecnico = Role::findByName('tecnico');
        $jefeTecnicos = Role::findByName('jefe_tecnicos');
        $limpieza = Role::findByName('limpieza');
        $jefeLimpieza = Role::findByName('jefe_limpieza');
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

        $jefeEntrenadores->syncPermissions([
            'crear entrenador',
            'editar entrenador',
            'eliminar entrenador',
            'crear clase',
            'editar clase',
            'eliminar clase',
            'crear horario clase',
            'editar horario clase',
            'eliminar horario clase',
        ]);

        // Técnico: permisos para gestionar máquinas
        $tecnico->syncPermissions([
            'crear máquina',
            'editar máquina',
            'eliminar máquina',
        ]);

        $jefeTecnicos->syncPermissions([
            'crear entrenador',
            'editar entrenador',
            'eliminar entrenador',
            'crear máquina',
            'editar máquina',
            'eliminar máquina',
        ]);

        // Limpieza: sin permisos especiales por ahora
        $limpieza->syncPermissions([]);

        $jefeLimpieza->syncPermissions([
            'crear entrenador',
            'editar entrenador',
            'eliminar entrenador',
        ]);

        $cliente->syncPermissions(['ver guia']);

        // --- Crear el superusuario inicial ---
        $super = User::firstOrCreate(
            ['email' => 'super@demo.com'],
            [
                'name' => 'Super Usuario',
                'password' => Hash::make('password'),
                'dni' => '00000000S',
                'direccion' => 'Dirección Superusuario',
            ]
        );

        // Asignar el rol
        $super->assignRole('superusuario');

        $this->command->info('✅ Superusuario creado: super@demo.com / password');

        // --- Crear jefes iniciales ---
        $jefeEntrenadoresUser = User::firstOrCreate(
            ['email' => 'jefe.entrenadores@demo.com'],
            [
                'name' => 'Jefe Entrenadores',
                'password' => Hash::make('password'),
                'dni' => '00000001E',
                'direccion' => 'Dirección Jefe Entrenadores',
            ]
        );
        $jefeEntrenadoresUser->assignRole('jefe_entrenadores');

        $jefeTecnicosUser = User::firstOrCreate(
            ['email' => 'jefe.tecnicos@demo.com'],
            [
                'name' => 'Jefe Tecnicos',
                'password' => Hash::make('password'),
                'dni' => '00000002T',
                'direccion' => 'Dirección Jefe Tecnicos',
            ]
        );
        $jefeTecnicosUser->assignRole('jefe_tecnicos');

        $jefeLimpiezaUser = User::firstOrCreate(
            ['email' => 'jefe.limpieza@demo.com'],
            [
                'name' => 'Jefe Limpieza',
                'password' => Hash::make('password'),
                'dni' => '00000003L',
                'direccion' => 'Dirección Jefe Limpieza',
            ]
        );
        $jefeLimpiezaUser->assignRole('jefe_limpieza');

        $this->command->info('✅ Jefes creados: jefe.entrenadores@demo.com, jefe.tecnicos@demo.com, jefe.limpieza@demo.com / password');
        $this->command->info('✅ Roles y permisos configurados correctamente.');
    }
}
