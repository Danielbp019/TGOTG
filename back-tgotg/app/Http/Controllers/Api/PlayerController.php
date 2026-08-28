<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBlessingRequest;
use App\Http\Requests\UpdateCivilizationRequest;
use App\Http\Resources\BlessingResource;
use App\Http\Resources\CivilizationResource;
use App\Models\Blessing;
use App\Models\Civilization;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    use ResolvesCurrentPlayer;

    public function resources(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'in_game' => false,
                'resources' => null,
            ]);
        }

        $player->load('cities');
        $speedMultiplier = (float) $player->world->speed_multiplier;

        $perHour = ['gold' => 0, 'wood' => 0, 'stone' => 0, 'iron' => 0, 'food' => 0];
        foreach ($player->cities as $city) {
            $perHour['gold'] += (int) round($city->gold_per_hour * $speedMultiplier);
            $perHour['wood'] += (int) round($city->wood_per_hour * $speedMultiplier);
            $perHour['stone'] += (int) round($city->stone_per_hour * $speedMultiplier);
            $perHour['iron'] += (int) round($city->iron_per_hour * $speedMultiplier);
            $perHour['food'] += (int) round($city->food_per_hour * $speedMultiplier);
        }

        return response()->json([
            'in_game' => true,
            'resources' => [
                'gold' => (int) $player->gold,
                'wood' => (int) $player->wood,
                'stone' => (int) $player->stone,
                'iron' => (int) $player->iron,
                'food' => (int) $player->food,
            ],
            'perHour' => $perHour,
        ]);
    }

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
                ? new CivilizationResource($player->civilization)
                : null,
        ]);
    }

    public function updateCivilization(UpdateCivilizationRequest $request): JsonResponse
    {
        $data = $request->validated();

        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            $player = Player::findOrCreateForWorld($request->user()->id);
        }

        $civilization = Civilization::where('key', $data['key'])->firstOrFail();
        $player->update(['civilization_id' => $civilization->id]);

        return response()->json([
            'civilization' => new CivilizationResource($civilization),
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
                ? new BlessingResource($player->blessing)
                : null,
        ]);
    }

    public function updateBlessing(UpdateBlessingRequest $request): JsonResponse
    {
        $data = $request->validated();

        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            $player = Player::findOrCreateForWorld($request->user()->id);
        }

        $blessing = Blessing::where('key', $data['key'])->firstOrFail();
        $player->update(['blessing_id' => $blessing->id]);

        return response()->json([
            'blessing' => new BlessingResource($blessing),
        ]);
    }
}
