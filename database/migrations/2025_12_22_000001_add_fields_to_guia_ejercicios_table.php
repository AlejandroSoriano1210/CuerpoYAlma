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
        Schema::table('guia_ejercicios', function (Blueprint $table) {
            $table->integer('series')->default(3);
            $table->integer('repeticiones')->default(10);
            $table->text('instrucciones')->nullable();
            $table->integer('orden')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guia_ejercicios', function (Blueprint $table) {
            $table->dropColumn(['series', 'repeticiones', 'instrucciones', 'orden']);
        });
    }
};
