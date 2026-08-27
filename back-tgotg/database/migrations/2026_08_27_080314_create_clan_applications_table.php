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
        Schema::create('clan_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('clan_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('player_id')->constrained()->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['clan_id', 'player_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clan_applications');
    }
};
