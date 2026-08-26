<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Biome extends Model
{
    /** @use HasFactory<BiomeFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'key',
        'label',
        'description',
        'bonus_resource',
        'bonus_value',
    ];

    protected function casts(): array
    {
        return [
            'bonus_value' => 'decimal:2',
        ];
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class)->withTimestamps();
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
