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
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('mes')->comment('Mes del pago (1-12)');
            $table->integer('ano')->comment('Año del pago');
            $table->decimal('monto', 10, 2)->nullable()->comment('Monto del pago');
            $table->text('notas')->nullable()->comment('Notas adicionales');
            $table->timestamps();

            // Índice único para evitar pagos duplicados del mismo mes/año
            $table->unique(['user_id', 'mes', 'ano']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
