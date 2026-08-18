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
        Schema::create('unit_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->string('name');
            $table->unsignedTinyInteger('tier');
            $table->text('description')->nullable();
            $table->unsignedInteger('attack');
            $table->unsignedInteger('defense');
            $table->unsignedInteger('gold_cost');
            $table->unsignedInteger('food_cost');
            $table->unsignedInteger('iron_cost');
            $table->decimal('food_upkeep', 4, 2);
            $table->unsignedInteger('training_minutes');
            $table->unsignedTinyInteger('required_barracks_level');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_types');
    }
};
