<?php

namespace App\Models;

use Database\Factories\BlessingFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Blessing extends Model
{
    /** @use HasFactory<BlessingFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'name',
        'benefit',
        'description',
    ];

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function userStatistics(): HasMany
    {
        return $this->hasMany(UserStatistic::class, 'most_used_blessing_id');
    }
}
