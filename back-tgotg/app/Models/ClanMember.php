<?php

namespace App\Models;

use Database\Factories\ClanMemberFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClanMember extends Model
{
    /** @use HasFactory<ClanMemberFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'clan_id',
        'player_id',
        'role',
        'joined_at',
    ];

    /**
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function clan(): BelongsTo
    {
        return $this->belongsTo(Clan::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    /**
     * Verifica si el miembro tiene permisos de administración.
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['leader', 'subleader', 'officer']);
    }
}
