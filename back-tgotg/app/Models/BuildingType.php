<?php

namespace App\Models;

use Database\Factories\BuildingTypeFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BuildingType extends Model
{
    /** @use HasFactory<BuildingTypeFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'name',
        'category',
    ];

    public function buildings(): HasMany
    {
        return $this->hasMany(Building::class);
    }
}
