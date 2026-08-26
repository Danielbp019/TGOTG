<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Models\Blessing;
use App\Models\BuildingType;
use App\Models\Civilization;
use App\Models\GameOption;
use App\Models\UnitType;
use App\Support\BuildingCosts;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

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
        $blessings = Blessing::orderBy('name')->get()->map(
            fn (Blessing $blessing) => $this->blessingPayload($blessing)
        );

        return response()->json([
            'blessings' => $blessings,
        ]);
    }

    public function civilizations(): JsonResponse
    {
        $civilizations = Civilization::orderBy('name')->get()->map(
            fn (Civilization $civilization) => [
                'key' => $civilization->key,
                'name' => $civilization->name,
                'benefit' => $civilization->benefit,
                'description' => $civilization->description,
                'bonus' => $civilization->bonus,
            ]
        );

        return response()->json([
            'civilizations' => $civilizations,
        ]);
    }

    public function buildingTypes(): JsonResponse
    {
        $buildingTypes = BuildingType::orderBy('category')->orderBy('name')->get()->map(
            fn (BuildingType $buildingType) => [
                'key' => $buildingType->key,
                'name' => $buildingType->name,
                'category' => $buildingType->category,
                'description' => $buildingType->description,
                'max_level' => $buildingType->max_level,
                'gold_cost' => $buildingType->gold_cost,
                'wood_cost' => $buildingType->wood_cost,
                'stone_cost' => $buildingType->stone_cost,
                'iron_cost' => $buildingType->iron_cost,
                'base_minutes' => $buildingType->base_minutes,
                'repair_material' => $buildingType->repair_material,
                'levels' => collect(range(1, (int) $buildingType->max_level))
                    ->map(fn (int $level) => BuildingCosts::costForLevel($buildingType, $level))
                    ->values(),
            ]
        );

        return response()->json([
            'building_types' => $buildingTypes,
        ]);
    }

    public function gameOptions(): JsonResponse
    {
        return response()->json([
            'durations' => $this->gameOptionPayload(GameOption::TYPE_DURATION),
            'multipliers' => $this->gameOptionPayload(GameOption::TYPE_MULTIPLIER),
        ]);
    }

    /**
     * Tipos de unidad visibles para el jugador.
     *
     * Sin filtro y sin civilización activa devuelve todas (agrupables por
     * `civilization.key` en el cliente); con civilización activa o con el
     * parámetro ?civilization=key devuelve únicamente esa civilización.
     */
    public function unitTypes(Request $request): JsonResponse
    {
        $data = $request->validate([
            'civilization' => ['nullable', 'string', 'exists:civilizations,key'],
        ]);

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
            ->values()
            ->map(fn (UnitType $unitType) => $this->unitTypePayload($unitType));

        return response()->json([
            'unit_types' => $unitTypes,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function unitTypePayload(UnitType $unitType): array
    {
        return [
            'key' => $unitType->key,
            'name' => $unitType->name,
            'tier' => $unitType->tier,
            'description' => $unitType->description,
            'attack' => $unitType->attack,
            'defense' => $unitType->defense,
            'gold_cost' => $unitType->gold_cost,
            'food_cost' => $unitType->food_cost,
            'iron_cost' => $unitType->iron_cost,
            'food_upkeep' => (float) $unitType->food_upkeep,
            'training_minutes' => $unitType->training_minutes,
            'required_barracks_level' => $unitType->required_barracks_level,
            'civilization' => $unitType->civilization === null ? null : [
                'key' => $unitType->civilization->key,
                'name' => $unitType->civilization->name,
            ],
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function gameOptionPayload(string $type): Collection
    {
        return GameOption::where('type', $type)
            ->orderBy('sort_order')
            ->get()
            ->map(
                fn (GameOption $option) => [
                    'key' => $option->key,
                    'label' => $option->label,
                    'value' => $option->value,
                    'description' => $option->description,
                ]
            );
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
