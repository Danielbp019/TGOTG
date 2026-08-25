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
        Schema::create('biome_region', function (Blueprint $table) {
            $table->foreignUuid('region_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUuid('biome_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->primary(['region_id', 'biome_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biome_region');
    }
};
