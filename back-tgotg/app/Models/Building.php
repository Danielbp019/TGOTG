<?php

namespace App\Models;

use Database\Factories\BuildingFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Building extends Model
{
    /** @use HasFactory<BuildingFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'city_id',
        'building_type_id',
        'level',
        'damage',
        'repair_started_at',
        'repair_paid',
        'shape',
        'x',
        'y',
        'width',
        'height',
    ];

    /**
     * @var array<string, string|int|bool>
     */
    protected $attributes = [
        'level' => 0,
        'damage' => 0,
        'repair_paid' => false,
        'shape' => 'diamond',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'damage' => 'integer',
            'repair_started_at' => 'datetime',
            'repair_paid' => 'boolean',
            'x' => 'integer',
            'y' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function buildingType(): BelongsTo
    {
        return $this->belongsTo(BuildingType::class);
    }
}
