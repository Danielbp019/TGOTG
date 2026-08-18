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
        Schema::create('cities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('world_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->unsignedBigInteger('gold')->default(0);
            $table->unsignedBigInteger('wood')->default(0);
            $table->unsignedBigInteger('stone')->default(0);
            $table->unsignedBigInteger('iron')->default(0);
            $table->unsignedBigInteger('food')->default(0);
            $table->unsignedInteger('gold_per_hour')->default(0);
            $table->unsignedInteger('wood_per_hour')->default(0);
            $table->unsignedInteger('stone_per_hour')->default(0);
            $table->unsignedInteger('iron_per_hour')->default(0);
            $table->unsignedInteger('food_per_hour')->default(0);
            $table->unsignedInteger('gold_consumption_per_hour')->default(0);
            $table->unsignedInteger('wood_consumption_per_hour')->default(0);
            $table->unsignedInteger('stone_consumption_per_hour')->default(0);
            $table->unsignedInteger('iron_consumption_per_hour')->default(0);
            $table->unsignedInteger('food_consumption_per_hour')->default(0);
            $table->unsignedInteger('population')->default(0);
            $table->unsignedTinyInteger('happiness')->default(0);
            $table->unsignedInteger('defense')->default(0);
            $table->unsignedInteger('stationed_troops')->default(0);
            $table->unsignedInteger('defense_power')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
