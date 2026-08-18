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
        Schema::create('buildings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('city_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('building_type_id')->constrained()->restrictOnDelete();
            $table->unsignedTinyInteger('level')->default(0);
            $table->unsignedTinyInteger('damage')->default(0);
            $table->timestamp('repair_started_at')->nullable();
            $table->boolean('repair_paid')->default(false);
            $table->string('shape')->default('diamond');
            $table->unsignedInteger('x');
            $table->unsignedInteger('y');
            $table->unsignedInteger('width');
            $table->unsignedInteger('height');
            $table->unique(['city_id', 'building_type_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buildings');
    }
};