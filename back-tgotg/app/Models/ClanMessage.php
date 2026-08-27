<?php

namespace App\Models;

use Database\Factories\ClanMessageFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClanMessage extends Model
{
    /** @use HasFactory<ClanMessageFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'clan_id',
        'sender_id',
        'body',
    ];

    public function clan(): BelongsTo
    {
        return $this->belongsTo(Clan::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
