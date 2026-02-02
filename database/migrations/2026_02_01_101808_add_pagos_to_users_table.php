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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('ultimo_pago_mes')->nullable()->comment('Último mes pagado (1-12)');
            $table->integer('ultimo_pago_ano')->nullable()->comment('Último año pagado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ultimo_pago_mes', 'ultimo_pago_ano']);
        });
    }
};
