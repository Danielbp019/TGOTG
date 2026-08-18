<?php

namespace App\Models;

use Database\Factories\CivilizationFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Civilization extends Model
{
    /** @use HasFactory<CivilizationFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'name',
        'description',
        'benefit',
        'bonus',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'bonus' => 'array',
        ];
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }
}
