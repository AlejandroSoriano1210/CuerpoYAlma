<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notificaciones_programadas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('mensaje');
            $table->string('url')->nullable();

            // Destinatarios: 'todos', 'clientes', 'empleados', 'entrenadores', 'tecnicos', 'limpieza', 'usuario_especifico'
            $table->string('destinatarios');
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();

            // Tipo de envío: 'unica_vez' o 'recurrente'
            $table->string('tipo_envio')->default('unica_vez');

            // Frecuencia para recurrentes: 'diaria', 'semanal', 'mensual', 'anual'
            $table->string('frecuencia')->nullable();

            // Día de la semana (1=lunes..7=domingo) para frecuencia semanal
            $table->unsignedTinyInteger('dia_semana')->nullable();

            // Día del mes (1-31) para frecuencia mensual
            $table->unsignedTinyInteger('dia_mes')->nullable();

            // Hora de envío (HH:MM)
            $table->time('hora_envio')->default('08:00');

            // Fecha de envío para notificaciones de una sola vez
            $table->date('fecha_envio')->nullable();

            // Control de ejecución
            $table->dateTime('ultima_ejecucion')->nullable();
            $table->dateTime('proxima_ejecucion')->nullable();
            $table->boolean('activa')->default(true);

            // Quién la creó
            $table->foreignId('created_by')->constrained('users');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones_programadas');
    }
};
