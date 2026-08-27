<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\UnitTypesRequest;
use App\Http\Resources\BlessingResource;
use App\Http\Resources\BuildingTypeResource;
use App\Http\Resources\CivilizationResource;
use App\Http\Resources\GameOptionResource;
use App\Http\Resources\UnitTypeResource;
use App\Models\Blessing;
use App\Models\BuildingType;
use App\Models\Civilization;
use App\Models\GameOption;
use App\Models\UnitType;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    use ResolvesCurrentPlayer;

    public function serverTime(): JsonResponse
    {
        return response()->json([
            'time' => now()->toIso8601String(),
        ]);
    }

    public function blessings(): JsonResponse
    {
        return response()->json([
            'blessings' => BlessingResource::collection(
                Blessing::orderBy('name')->get()
            ),
        ]);
    }

    public function civilizations(): JsonResponse
    {
        return response()->json([
            'civilizations' => CivilizationResource::collection(
                Civilization::orderBy('name')->get()
            ),
        ]);
    }

    public function buildingTypes(): JsonResponse
    {
        return response()->json([
            'building_types' => BuildingTypeResource::collection(
                BuildingType::orderBy('category')->orderBy('name')->get()
            ),
        ]);
    }

    public function gameOptions(): JsonResponse
    {
        return response()->json([
            'durations' => GameOptionResource::collection(
                GameOption::where('type', GameOption::TYPE_DURATION)->orderBy('sort_order')->get()
            ),
            'multipliers' => GameOptionResource::collection(
                GameOption::where('type', GameOption::TYPE_MULTIPLIER)->orderBy('sort_order')->get()
            ),
        ]);
    }

    /**
     * Tipos de unidad visibles para el jugador.
     *
     * Sin filtro y sin civilización activa devuelve todas (agrupables por
     * `civilization.key` en el cliente); con civilización activa o con el
     * parámetro ?civilization=key devuelve únicamente esa civilización.
     */
    public function unitTypes(UnitTypesRequest $request): JsonResponse
    {
        $data = $request->validated();

        $civilizationKey = $data['civilization'] ?? null;

        if ($civilizationKey === null) {
            $player = $this->currentPlayer($request->user()->id);
            $civilizationKey = $player?->civilization?->key;
        }

        $unitTypes = UnitType::query()
            ->with('civilization')
            ->when($civilizationKey, function ($query) use ($civilizationKey) {
                $query->where(function ($query) use ($civilizationKey) {
                    // La propia civilización + unidades neutrales compartidas.
                    $query->whereHas('civilization', fn ($q) => $q->where('key', $civilizationKey))
                        ->orWhereNull('civilization_id');
                });
            })
            ->get()
            ->values()
            ->sort(function (UnitType $a, UnitType $b): int {
                $civA = $a->civilization?->name;
                $civB = $b->civilization?->name;

                if ($civA === null || $civB === null) {
                    if ($civA !== $civB) {
                        // Las unidades neutrales van al final.
                        return $civA === null ? 1 : -1;
                    }

                    return $a->tier <=> $b->tier;
                }

                return [$civA, $a->tier] <=> [$civB, $b->tier];
            })
            ->values();

        return response()->json([
            'unit_types' => UnitTypeResource::collection($unitTypes),
        ]);
    }
}
