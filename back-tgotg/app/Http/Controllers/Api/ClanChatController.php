<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendClanMessageRequest;
use App\Models\Clan;
use App\Models\ClanMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClanChatController extends Controller
{
    use ResolvesCurrentPlayer;

    /**
     * Obtiene los últimos mensajes del chat del clan.
     */
    public function index(Request $request, Clan $clan): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasMember($player->id)) {
            return response()->json([
                'message' => __('No tienes acceso a este clan.'),
            ], 403);
        }

        $limit = config('game_balance.clan.chat_max_messages', 100);

        $messages = ClanMessage::where('clan_id', $clan->id)
            ->with('sender')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'messages' => $messages->map(fn (ClanMessage $message) => [
                'id' => $message->id,
                'body' => $message->body,
                'sender' => [
                    'id' => $message->sender->id,
                    'nick' => $message->sender->nick,
                ],
                'createdAt' => $message->created_at->toIso8601String(),
            ])->values()->all(),
        ]);
    }

    /**
     * Envía un mensaje al chat del clan.
     */
    public function store(SendClanMessageRequest $request, Clan $clan): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasMember($player->id)) {
            return response()->json([
                'message' => __('No tienes acceso a este clan.'),
            ], 403);
        }

        $message = ClanMessage::create([
            'clan_id' => $clan->id,
            'sender_id' => $request->user()->id,
            'body' => $request->validated()['body'],
        ]);

        $message->load('sender');

        return response()->json([
            'message' => [
                'id' => $message->id,
                'body' => $message->body,
                'sender' => [
                    'id' => $message->sender->id,
                    'nick' => $message->sender->nick,
                ],
                'createdAt' => $message->created_at->toIso8601String(),
            ],
        ], 201);
    }
}
