<?php

namespace App\Models;

use Database\Factories\CityFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    /** @use HasFactory<CityFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'player_id',
        'world_id',
        'region_id',
        'biome_id',
        'name',
        'gold',
        'wood',
        'stone',
        'iron',
        'food',
        'gold_per_hour',
        'wood_per_hour',
        'stone_per_hour',
        'iron_per_hour',
        'food_per_hour',
        'gold_consumption_per_hour',
        'wood_consumption_per_hour',
        'stone_consumption_per_hour',
        'iron_consumption_per_hour',
        'food_consumption_per_hour',
        'population',
        'happiness',
        'defense',
        'stationed_troops',
        'defense_power',
        'protection_until',
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
        'gold_per_hour' => 0,
        'wood_per_hour' => 0,
        'stone_per_hour' => 0,
        'iron_per_hour' => 0,
        'food_per_hour' => 0,
        'gold_consumption_per_hour' => 0,
        'wood_consumption_per_hour' => 0,
        'stone_consumption_per_hour' => 0,
        'iron_consumption_per_hour' => 0,
        'food_consumption_per_hour' => 0,
        'population' => 0,
        'happiness' => 0,
        'defense' => 0,
        'stationed_troops' => 0,
        'defense_power' => 0,
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
            'gold_per_hour' => 'integer',
            'wood_per_hour' => 'integer',
            'stone_per_hour' => 'integer',
            'iron_per_hour' => 'integer',
            'food_per_hour' => 'integer',
            'gold_consumption_per_hour' => 'integer',
            'wood_consumption_per_hour' => 'integer',
            'stone_consumption_per_hour' => 'integer',
            'iron_consumption_per_hour' => 'integer',
            'food_consumption_per_hour' => 'integer',
            'population' => 'integer',
            'happiness' => 'integer',
            'defense' => 'integer',
            'stationed_troops' => 'integer',
            'defense_power' => 'integer',
            'protection_until' => 'datetime',
        ];
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function world(): BelongsTo
    {
        return $this->belongsTo(World::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function biome(): BelongsTo
    {
        return $this->belongsTo(Biome::class);
    }

    public function buildings(): HasMany
    {
        return $this->hasMany(Building::class);
    }
}
