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
            $table->string('nombre')->after('user_id');
            $table->integer('capacidad')->default(10)->after('nombre');
            $table->text('descripcion')->nullable()->after('hora_fin');

            $table->dropForeign(['clase_id']);
            $table->dropColumn('clase_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('horario_clases', function (Blueprint $table) {
            $table->dropColumn([
                'nombre',
                'capacidad',
                'fecha',
                'hora_inicio',
                'hora_fin',
                'descripcion',
            ]);
            $table->foreignId('clase_id')->constrained('clases')->onDelete('cascade');
        });
    }
};
