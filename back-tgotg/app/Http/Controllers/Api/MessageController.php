<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\SendConversationMessageRequest;
use App\Http\Requests\StoreConversationRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    use ResolvesCurrentPlayer;

    public function index(Request $request): JsonResponse
    {
        $world = $this->currentWorld();

        if ($world === null) {
            return response()->json(['conversations' => []]);
        }

        $userId = $request->user()->id;

        $conversations = Conversation::query()
            ->where('world_id', $world->id)
            ->where(fn ($query) => $query
                ->where('user_one_id', $userId)
                ->orWhere('user_two_id', $userId))
            ->with(['userOne', 'userTwo', 'lastMessage'])
            ->withCount(['messages as unread_count' => fn ($query) => $query
                ->where('sender_id', '!=', $userId)
                ->whereNull('read_at'),
            ])
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json([
            'conversations' => $conversations->map(
                fn (Conversation $conversation) => $this->summaryPayload($conversation, $userId)
            )->values(),
        ]);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if ($user->cannot('participate', $conversation)) {
            return response()->json([
                'message' => __('La conversación no existe.'),
            ], 404);
        }

        $userId = $user->id;

        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->load([
            'messages' => fn ($query) => $query->orderBy('created_at'),
            'userOne',
            'userTwo',
        ]);

        return response()->json([
            'conversation' => $this->detailPayload($conversation, $userId),
        ]);
    }

    public function store(StoreConversationRequest $request): JsonResponse
    {
        $userId = $request->user()->id;

        $player = $this->currentPlayer($userId);

        if ($player === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para enviar mensajes.'),
            ], 422);
        }

        $data = $request->validated();

        $world = $player->world;
        $recipient = User::where('nick', $data['recipient_nick'])
            ->whereHas('players', fn ($query) => $query->where('world_id', $world->id))
            ->where('id', '!=', $userId)
            ->first();

        if ($recipient === null) {
            return response()->json([
                'message' => __('No hay ningún dios con ese nombre en la contienda.'),
            ], 422);
        }

        $conversation = $this->findOrCreateConversation($world->id, $userId, $recipient->id);

        $this->appendMessage($conversation, $userId, $data['body']);

        return response()->json([
            'conversation' => $this->detailPayload($conversation, $userId),
        ], 201);
    }

    public function sendMessage(SendConversationMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if ($user->cannot('participate', $conversation)) {
            return response()->json([
                'message' => __('La conversación no existe.'),
            ], 404);
        }

        $data = $request->validated();

        $this->appendMessage($conversation, $user->id, $data['body']);

        return response()->json([
            'conversation' => $this->detailPayload($conversation, $user->id),
        ], 201);
    }

    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        if ($request->user()->cannot('participate', $conversation)) {
            return response()->json([
                'message' => __('La conversación no existe.'),
            ], 404);
        }

        $conversation->delete();

        return response()->json([
            'message' => __('Conversación eliminada.'),
        ]);
    }

    private function findOrCreateConversation(string $worldId, string $userId, string $recipientId): Conversation
    {
        $conversation = Conversation::where('world_id', $worldId)
            ->where(function ($query) use ($userId, $recipientId) {
                $query
                    ->where('user_one_id', $userId)
                    ->where('user_two_id', $recipientId)
                    ->orWhere('user_one_id', $recipientId)
                    ->where('user_two_id', $userId);
            })
            ->first();

        if ($conversation !== null) {
            return $conversation;
        }

        return Conversation::create([
            'world_id' => $worldId,
            'user_one_id' => $userId,
            'user_two_id' => $recipientId,
        ]);
    }

    private function appendMessage(Conversation $conversation, string $senderId, string $body): Message
    {
        $message = $conversation->messages()->create([
            'sender_id' => $senderId,
            'body' => $body,
        ]);

        $conversation->update(['last_message_at' => $message->created_at]);

        return $message;
    }

    private function otherParticipant(Conversation $conversation, string $userId): User
    {
        return $conversation->user_one_id === $userId
            ? $conversation->userTwo
            : $conversation->userOne;
    }

    /**
     * @return array{id: string, participant: array{nick: string}, lastMessage: array{body: string, sentAt: string, fromMe: bool}|null, unreadCount: int}
     */
    private function summaryPayload(Conversation $conversation, string $userId): array
    {
        $last = $conversation->lastMessage;

        return [
            'id' => $conversation->id,
            'participant' => [
                'nick' => $this->otherParticipant($conversation, $userId)->nick,
            ],
            'lastMessage' => $last ? [
                'body' => $last->body,
                'sentAt' => $last->created_at->toIso8601String(),
                'fromMe' => $last->sender_id === $userId,
            ] : null,
            'unreadCount' => $conversation->unread_count,
        ];
    }

    /**
     * @return array{id: string, participant: array{nick: string}, messages: list<array{id: string, body: string, sentAt: string, fromMe: bool}>}
     */
    private function detailPayload(Conversation $conversation, string $userId): array
    {
        return [
            'id' => $conversation->id,
            'participant' => [
                'nick' => $this->otherParticipant($conversation, $userId)->nick,
            ],
            'messages' => $conversation->messages
                ->map(
                    fn (Message $message) => [
                        'id' => $message->id,
                        'body' => $message->body,
                        'sentAt' => $message->created_at->toIso8601String(),
                        'fromMe' => $message->sender_id === $userId,
                    ]
                )
                ->values()
                ->all(),
        ];
    }
}
