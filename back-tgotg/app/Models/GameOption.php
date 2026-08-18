<?php

namespace App\Models;

use Database\Factories\GameOptionFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameOption extends Model
{
    /** @use HasFactory<GameOptionFactory> */
    use HasFactory, HasUuids;

    public const TYPE_DURATION = 'duration';

    public const TYPE_MULTIPLIER = 'multiplier';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'type',
        'key',
        'label',
        'value',
        'description',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'float',
            'sort_order' => 'integer',
        ];
    }
}
