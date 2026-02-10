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
        Schema::create('guia_progreso', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('guia_id')->constrained('guias')->onDelete('cascade');
            $table->foreignId('guia_ejercicio_id')->constrained('guia_ejercicios')->onDelete('cascade');
            $table->boolean('completado')->default(false);
            $table->timestamps();

            // Índice compuesto para evitar duplicados
            $table->unique(['user_id', 'guia_id', 'guia_ejercicio_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guia_progreso');
    }
};
