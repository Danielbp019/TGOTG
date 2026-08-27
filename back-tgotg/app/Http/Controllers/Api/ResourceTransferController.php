<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\TransferResourcesRequest;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ResourceTransferController extends Controller
{
    use ResolvesCurrentPlayer;

    /**
     * Envía recursos a otro miembro del mismo clan.
     */
    public function store(TransferResourcesRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $sender = $this->currentPlayer($userId);

        if ($sender === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para enviar recursos.'),
            ], 422);
        }

        if ($sender->clan_id === null) {
            return response()->json([
                'message' => __('Debes pertenecer a un clan para enviar recursos.'),
            ], 422);
        }

        $data = $request->validated();
        $recipient = Player::find($data['recipient_player_id']);

        if ($recipient === null) {
            return response()->json([
                'message' => __('El destinatario no existe.'),
            ], 422);
        }

        if ($recipient->clan_id !== $sender->clan_id) {
            return response()->json([
                'message' => __('Solo puedes enviar recursos a miembros de tu mismo clan.'),
            ], 422);
        }

        if ($recipient->user_id === $userId) {
            return response()->json([
                'message' => __('No puedes enviar recursos a ti mismo.'),
            ], 422);
        }

        $resources = [
            'gold' => $data['gold'] ?? 0,
            'wood' => $data['wood'] ?? 0,
            'stone' => $data['stone'] ?? 0,
            'iron' => $data['iron'] ?? 0,
            'food' => $data['food'] ?? 0,
        ];

        foreach ($resources as $resource => $amount) {
            if ($amount > 0 && $sender->{$resource} < $amount) {
                return response()->json([
                    'message' => __('No tienes suficiente :resource.', ['resource' => $resource]),
                ], 422);
            }
        }

        $totalAmount = array_sum($resources);

        if ($totalAmount === 0) {
            return response()->json([
                'message' => __('Debes enviar al menos un recurso.'),
            ], 422);
        }

        DB::transaction(function () use ($sender, $recipient, $resources) {
            foreach ($resources as $resource => $amount) {
                if ($amount > 0) {
                    $sender->decrement($resource, $amount);
                    $recipient->increment($resource, $amount);
                }
            }
        });

        return response()->json([
            'message' => __('Recursos enviados correctamente.'),
            'sender' => [
                'gold' => $sender->fresh()->gold,
                'wood' => $sender->fresh()->wood,
                'stone' => $sender->fresh()->stone,
                'iron' => $sender->fresh()->iron,
                'food' => $sender->fresh()->food,
            ],
        ]);
    }
}
