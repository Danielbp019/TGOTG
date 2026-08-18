<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blessing;
use App\Models\Player;
use App\Models\World;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function blessing(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'in_game' => false,
                'blessing' => null,
            ]);
        }

        return response()->json([
            'in_game' => true,
            'blessing' => $player->blessing
                ? $this->blessingPayload($player->blessing)
                : null,
        ]);
    }

    public function updateBlessing(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'exists:blessings,key'],
        ]);

        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        $blessing = Blessing::where('key', $data['key'])->firstOrFail();
        $player->update(['blessing_id' => $blessing->id]);

        return response()->json([
            'blessing' => $this->blessingPayload($blessing),
        ]);
    }

    private function currentPlayer(string $userId): ?Player
    {
        $world = World::where('status', 'running')
            ->latest('started_at')
            ->first();

        if ($world === null) {
            return null;
        }

        return Player::where('world_id', $world->id)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * @return array{key: string, name: string, benefit: string, description: string|null}
     */
    private function blessingPayload(Blessing $blessing): array
    {
        return [
            'key' => $blessing->key,
            'name' => $blessing->name,
            'benefit' => $blessing->benefit,
            'description' => $blessing->description,
        ];
    }
}
