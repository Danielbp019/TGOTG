<?php

namespace App\Models;

use Database\Factories\WorldReportFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorldReport extends Model
{
    /** @use HasFactory<WorldReportFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'world_id',
        'stats',
        'finished_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stats' => 'array',
            'finished_at' => 'datetime',
        ];
    }

    public function world(): BelongsTo
    {
        return $this->belongsTo(World::class);
    }
}
