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
        Schema::create('user_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('peso_kg', 5, 2)->nullable();
            $table->decimal('altura_cm', 5, 2)->nullable();
            $table->decimal('grasa_corporal_pct', 5, 2)->nullable();
            $table->date('fecha_medicion');
            $table->timestamps();

            $table->index(['user_id', 'fecha_medicion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_measurements');
    }
};
