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
        Schema::create('lista_espera_clases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('horario_clase_id')->constrained('horario_clases')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('posicion')->default(1);
            $table->timestamps();

            // Índice para evitar duplicados
            $table->unique(['horario_clase_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lista_espera_clases');
    }
};
