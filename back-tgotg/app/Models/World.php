<?php

namespace App\Models;

use Database\Factories\WorldFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class World extends Model
{
    /** @use HasFactory<WorldFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'status',
        'duration_days',
        'speed_multiplier',
        'started_at',
        'ended_at',
        'created_by',
    ];

    /**
     * @var array<string, string>
     */
    protected $attributes = [
        'status' => 'pending',
        'speed_multiplier' => 1,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'speed_multiplier' => 'float',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function worldReports(): HasMany
    {
        return $this->hasMany(WorldReport::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
