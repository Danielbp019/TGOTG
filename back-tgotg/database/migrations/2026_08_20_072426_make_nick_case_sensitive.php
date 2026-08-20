<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Solo MySQL/MariaDB: cambiar el collation a utf8mb4_bin para que
        // el índice unique de nick sea sensible a mayúsculas/minúsculas
        // ("Thor" y "thor" son nicks distintos). SQLite ya es case-sensitive.
        if (DB::getDriverName() === 'mysql') {
            DB::statement(
                'ALTER TABLE `users` MODIFY `nick` VARCHAR(255) '
                .'CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL'
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement(
                'ALTER TABLE `users` MODIFY `nick` VARCHAR(255) '
                .'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL'
            );
        }
    }
};
