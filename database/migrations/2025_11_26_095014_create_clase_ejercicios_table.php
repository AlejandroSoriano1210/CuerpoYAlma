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
        Schema::create('clase_ejercicios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clase_id')->constrained('clases')->onDelete('cascade');
            $table->foreignId('ejercicio_id')->constrained('ejercicios')->onDelete('cascade');
            $table->integer('series')->default(3);
            $table->integer('repeticiones')->default(10);
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->unique(['clase_id', 'ejercicio_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clase_ejercicios');
    }
};
