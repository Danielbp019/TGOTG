<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blessing;
use App\Models\BuildingType;
use App\Models\Civilization;
use App\Models\GameOption;
use App\Support\BuildingCosts;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class SystemController extends Controller
{
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
