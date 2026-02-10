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
        Schema::create('guia_asignaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('guia_id')->constrained('guias')->onDelete('cascade');
            $table->string('frecuencia', 20)->default('semanal');
            $table->timestamps();

            $table->unique(['user_id', 'guia_id', 'frecuencia']);
            $table->index(['user_id', 'frecuencia']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guia_asignaciones');
    }
};
