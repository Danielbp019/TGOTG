<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    /** @use HasFactory<RegionFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'key',
        'label',
        'polygon',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'polygon' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function biomes(): BelongsToMany
    {
        return $this->belongsToMany(Biome::class)->withTimestamps();
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
