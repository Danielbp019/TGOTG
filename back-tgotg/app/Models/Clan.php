<?php

namespace App\Models;

use Database\Factories\ClanFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clan extends Model
{
    /** @use HasFactory<ClanFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'acronym',
        'leader_id',
    ];

    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ClanMember::class);
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ClanApplication::class);
    }

    public function bulletins(): HasMany
    {
        return $this->hasMany(ClanBulletin::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ClanMessage::class);
    }

    /**
     * Verifica si un jugador es miembro del clan.
     */
    public function hasMember(string $playerId): bool
    {
        return $this->members()->where('player_id', $playerId)->exists();
    }

    /**
     * Verifica si un jugador tiene permisos de administración (líder, sublíder o oficial).
     */
    public function hasAdminPermission(string $playerId): bool
    {
        return $this->members()
            ->where('player_id', $playerId)
            ->whereIn('role', ['leader', 'subleader', 'officer'])
            ->exists();
    }

    /**
     * Cuenta los miembros activos del clan.
     */
    public function memberCount(): int
    {
        return $this->members()->count();
    }
}
