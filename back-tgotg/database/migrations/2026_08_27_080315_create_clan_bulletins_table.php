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
        Schema::create('clan_bulletins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('clan_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('author_id')->constrained('users');
            $table->string('title');
            $table->text('content');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clan_bulletins');
    }
};
