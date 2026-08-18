<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Models\Blessing;
use App\Models\Civilization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    use ResolvesCurrentPlayer;

    public function civilization(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'in_game' => false,
                'civilization' => null,
            ]);
        }

        return response()->json([
            'in_game' => true,
            'civilization' => $player->civilization
                ? $this->civilizationPayload($player->civilization)
                : null,
        ]);
    }

    public function updateCivilization(Request $request): JsonResponse
    {
        $data = $request->validate([
            'key' => ['required', 'string', 'exists:civilizations,key'],
        ]);

        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        $civilization = Civilization::where('key', $data['key'])->firstOrFail();
        $player->update(['civilization_id' => $civilization->id]);

        return response()->json([
            'civilization' => $this->civilizationPayload($civilization),
        ]);
    }

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

    /**
     * @return array{key: string, name: string, benefit: string, description: string|null}
     */
    private function civilizationPayload(Civilization $civilization): array
    {
        return [
            'key' => $civilization->key,
            'name' => $civilization->name,
            'benefit' => $civilization->benefit,
            'description' => $civilization->description,
        ];
    }
}
