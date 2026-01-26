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
        Schema::table('horario_clases', function (Blueprint $table) {
            // 1️⃣ Eliminar la foreign key antigua
            $table->dropForeign(['entrenador_id']);

            // 2️⃣ Renombrar columna
            $table->renameColumn('entrenador_id', 'user_id');
        });

        Schema::table('horario_clases', function (Blueprint $table) {
            // 3️⃣ Crear la nueva foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('horario_clases', function (Blueprint $table) {
            // Revertir: borrar FK nueva
            $table->dropForeign(['user_id']);

            // Renombrar de vuelta
            $table->renameColumn('user_id', 'entrenador_id');
        });

        Schema::table('horario_clases', function (Blueprint $table) {
            // Restaurar FK original
            $table->foreign('entrenador_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
