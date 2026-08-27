<?php

namespace App\Models;

use Database\Factories\ClanBulletinFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClanBulletin extends Model
{
    /** @use HasFactory<ClanBulletinFactory> */
    use HasFactory, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'clan_id',
        'author_id',
        'title',
        'content',
    ];

    public function clan(): BelongsTo
    {
        return $this->belongsTo(Clan::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
