<?php

namespace App\Models;

use Database\Factories\UnitTypeFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnitType extends Model
{
    /** @use HasFactory<UnitTypeFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'civilization_id',
        'key',
        'name',
        'tier',
        'description',
        'attack',
        'defense',
        'gold_cost',
        'food_cost',
        'iron_cost',
        'food_upkeep',
        'training_minutes',
        'required_barracks_level',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tier' => 'integer',
            'attack' => 'integer',
            'defense' => 'integer',
            'gold_cost' => 'integer',
            'food_cost' => 'integer',
            'iron_cost' => 'integer',
            'food_upkeep' => 'float',
            'training_minutes' => 'integer',
            'required_barracks_level' => 'integer',
        ];
    }

    /**
     * Civilización dueña del tipo de unidad (null = unidad neutral compartida).
     */
    public function civilization(): BelongsTo
    {
        return $this->belongsTo(Civilization::class);
    }
}
