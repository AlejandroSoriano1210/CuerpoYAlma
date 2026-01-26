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
            $table->decimal('peso_kg', 5, 2)->nullable()->after('telefono');
            $table->decimal('altura_cm', 5, 2)->nullable()->after('peso_kg');
            $table->decimal('grasa_corporal_pct', 5, 2)->nullable()->after('altura_cm');
            $table->decimal('imc', 5, 2)->nullable()->after('grasa_corporal_pct');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['peso_kg', 'altura_cm', 'grasa_corporal_pct', 'imc']);
        });
    }
};
