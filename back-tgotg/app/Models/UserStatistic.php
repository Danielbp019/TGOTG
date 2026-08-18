<?php

namespace App\Models;

use Database\Factories\UserStatisticFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStatistic extends Model
{
    /** @use HasFactory<UserStatisticFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'games_played',
        'most_used_blessing_id',
        'most_played_civilization_id',
    ];

    /**
     * @var array<string, int>
     */
    protected $attributes = [
        'games_played' => 0,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'games_played' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mostUsedBlessing(): BelongsTo
    {
        return $this->belongsTo(Blessing::class, 'most_used_blessing_id');
    }

    public function mostPlayedCivilization(): BelongsTo
    {
        return $this->belongsTo(Civilization::class, 'most_played_civilization_id');
    }
}
