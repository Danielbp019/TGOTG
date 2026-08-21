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
        Schema::create('building_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('category');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('max_level')->default(5);
            $table->unsignedInteger('gold_cost')->default(0);
            $table->unsignedInteger('wood_cost')->default(0);
            $table->unsignedInteger('stone_cost')->default(0);
            $table->unsignedInteger('iron_cost')->default(0);
            $table->unsignedInteger('base_minutes')->default(0);
            $table->string('repair_material')->default('stone');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('building_types');
    }
};
