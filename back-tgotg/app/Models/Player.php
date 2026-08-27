<?php

namespace App\Models;

use App\Support\StartingConfig;
use Database\Factories\PlayerFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    /** @use HasFactory<PlayerFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'world_id',
        'user_id',
        'civilization_id',
        'blessing_id',
        'clan_id',
        'gold',
        'wood',
        'stone',
        'iron',
        'food',
    ];

    /**
     * @var array<string, int>
     */
    protected $attributes = [
        'gold' => 0,
        'wood' => 0,
        'stone' => 0,
        'iron' => 0,
        'food' => 0,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gold' => 'integer',
            'wood' => 'integer',
            'stone' => 'integer',
            'iron' => 'integer',
            'food' => 'integer',
        ];
    }

    public function world(): BelongsTo
    {
        return $this->belongsTo(World::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function civilization(): BelongsTo
    {
        return $this->belongsTo(Civilization::class);
    }

    public function blessing(): BelongsTo
    {
        return $this->belongsTo(Blessing::class);
    }

    public function clan(): BelongsTo
    {
        return $this->belongsTo(Clan::class);
    }

    public function clanMember(): HasOne
    {
        return $this->hasOne(ClanMember::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    /**
     * Busca o crea un jugador para el usuario en el mundo en curso.
     *
     * Si el usuario ya tiene un jugador en el mundo actual, lo retorna.
     * Si no, crea uno con los recursos iniciales.
     */
    public static function findOrCreateForWorld(string $userId): static
    {
        $world = World::where('status', 'running')
            ->latest('started_at')
            ->first();

        if ($world === null) {
            abort(404, __('No hay una contienda en curso.'));
        }

        return static::firstOrCreate(
            ['world_id' => $world->id, 'user_id' => $userId],
            [
                'gold' => StartingConfig::cityValues()['gold'],
                'wood' => StartingConfig::cityValues()['wood'],
                'stone' => StartingConfig::cityValues()['stone'],
                'iron' => StartingConfig::cityValues()['iron'],
                'food' => StartingConfig::cityValues()['food'],
            ],
        );
    }
}
