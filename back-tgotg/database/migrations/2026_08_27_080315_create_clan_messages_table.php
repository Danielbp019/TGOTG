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
        Schema::create('clan_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('clan_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('sender_id')->constrained('users');
            $table->text('body');
            $table->timestamps();

            $table->index(['clan_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clan_messages');
    }
};
