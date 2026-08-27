<?php

namespace App\Models;

use Database\Factories\ClanApplicationFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClanApplication extends Model
{
    /** @use HasFactory<ClanApplicationFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'clan_id',
        'player_id',
        'message',
        'status',
    ];

    public function clan(): BelongsTo
    {
        return $this->belongsTo(Clan::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }
}
