<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\RepairBuildingRequest;
use App\Http\Requests\StoreCityRequest;
use App\Models\Biome;
use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\Region;
use App\Support\BuildingCosts;
use App\Support\BuildingRepair;
use App\Support\CityLayouts;
use App\Support\CityState;
use App\Support\StartingConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CitiesController extends Controller
{
    use ResolvesCurrentPlayer;

    public function index(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            $world = $this->currentWorld();

            if ($world === null) {
                return response()->json([
                    'message' => __('No hay una contienda en curso.'),
                ], 404);
            }

            return response()->json(['cities' => []]);
        }

        $cities = City::with(['region', 'biome'])
            ->where('player_id', $player->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (City $city) => [
                'id' => $city->id,
                'name' => $city->name,
                'region' => $city->region ? [
                    'id' => $city->region->id,
                    'key' => $city->region->key,
                    'label' => $city->region->label,
                ] : null,
                'biome' => $city->biome ? [
                    'id' => $city->biome->id,
                    'key' => $city->biome->key,
                ] : null,
                'protectionUntil' => $city->protection_until?->toIso8601String(),
                'defensePower' => (int) $city->defense_power,
            ]);

        return response()->json(['cities' => $cities]);
    }

    public function show(Request $request, City $city): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        if ($city->player_id !== $player->id) {
            return response()->json([
                'message' => __('Esa ciudad no te pertenece.'),
            ], 403);
        }

        $city->load(['buildings.buildingType']);
        CityState::sync($city);

        return response()->json([
            'city' => CityState::payload($city, $player),
        ]);
    }

    public function store(StoreCityRequest $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            $player = Player::findOrCreateForWorld($request->user()->id);
        }

        $data = $request->validated();

        $name = trim($data['name']);

        // Validar que el bioma pertenece a la región (pivot)
        $valid = Region::where('id', $data['region_id'])
            ->whereHas('biomes', fn ($q) => $q->where('biomes.id', $data['biome_id']))
            ->exists();

        if (! $valid) {
            return response()->json([
                'message' => __('El bioma no pertenece a la región seleccionada.'),
                'errors' => ['biome_id' => [__('El bioma no pertenece a la región seleccionada.')]],
            ], 422);
        }

        $region = Region::find($data['region_id']);
        $biome = Biome::find($data['biome_id']);

        // La ciudad no recibe copia de recursos (viven en el jugador),
        // pero sí sus atributos base: producción por hora, población, defensa…
        $cityValues = Arr::except(StartingConfig::cityValues(), [
            'name', 'gold', 'wood', 'stone', 'iron', 'food',
        ]);

        $city = City::create(array_merge($cityValues, [
            'player_id' => $player->id,
            'world_id' => $player->world_id,
            'region_id' => $region->id,
            'biome_id' => $biome->id,
            'name' => $name,
        ]));

        $plotKeys = array_column(CityLayouts::plots(), 'key');
        $typeIdsByPlotKey = BuildingType::whereIn('key', $plotKeys)->pluck('id', 'key');

        foreach (CityLayouts::plots() as $plot) {
            Building::create([
                'city_id' => $city->id,
                'building_type_id' => $typeIdsByPlotKey[$plot['key']] ?? null,
                'level' => $plot['key'] === 'ayuntamiento' ? 1 : 0,
            ]);
        }

        $city->load(['region', 'biome']);

        return response()->json([
            'city' => [
                'id' => $city->id,
                'name' => $city->name,
                'region' => [
                    'id' => $city->region->id,
                    'key' => $city->region->key,
                    'label' => $city->region->label,
                ],
                'biome' => [
                    'id' => $city->biome->id,
                    'key' => $city->biome->key,
                ],
            ],
        ], 201);
    }

    public function upgrade(Request $request, City $city, Building $building): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        if ($city->player_id !== $player->id) {
            return response()->json([
                'message' => __('Esa ciudad no te pertenece.'),
            ], 403);
        }

        if ($building->city_id !== $city->id) {
            return response()->json([
                'message' => __('Ese edificio no pertenece a esa ciudad.'),
            ], 403);
        }

        // Sincroniza upgrades terminados antes de validar
        $city->load('buildings.buildingType');
        CityState::applyUpgrades($city);
        $building->refresh();

        if ($building->damage > 0) {
            return response()->json([
                'message' => __('Ese edificio está dañado. Repáralo antes de mejorarlo.'),
            ], 422);
        }

        if ($building->repair_started_at !== null) {
            return response()->json([
                'message' => __('Ese edificio está en reparación. Espera a que termine.'),
            ], 409);
        }

        if ($building->upgrade_finishes_at !== null) {
            return response()->json([
                'message' => __('Ese edificio ya tiene una mejora en curso.'),
            ], 409);
        }

        $maxLevel = (int) $building->buildingType->max_level;

        if ($building->level >= $maxLevel) {
            return response()->json([
                'message' => __('Ese edificio ya está al nivel máximo.'),
            ], 422);
        }

        $nextLevel = $building->level + 1;
        $cost = BuildingCosts::costForLevel($building->buildingType, $nextLevel);

        // Atajo para pruebas: ?instant=1 solo en debug o FAST_BUILD_FACTOR en config
        $isInstant = $request->query('instant') === '1' && config('app.debug');
        $fastFactor = (float) config('game_balance.fast_build_factor');

        $finishesAt = null;

        if (! $isInstant) {
            $minutes = $cost['minutes'];

            if ($fastFactor > 0 && $fastFactor < 1) {
                $minutes = (int) max(1, round($minutes * $fastFactor));
            }

            $speedMultiplier = (float) $player->world->speed_multiplier;

            // El tiempo se acorta con la velocidad del mundo
            $effectiveMinutes = $speedMultiplier > 0 ? $minutes / $speedMultiplier : $minutes;
            $finishesAt = now()->addMinutes($effectiveMinutes);

            // Factor muy pequeño: finaliza en segundos en lugar de minutos
            if ($fastFactor > 0 && $fastFactor < 0.02) {
                $effectiveSeconds = (int) max(5, round($effectiveMinutes * 60));
                $finishesAt = now()->addSeconds($effectiveSeconds);
            }
        }

        // Todo gasto se paga con los recursos generales del jugador.
        $sufficient = DB::transaction(function () use ($player, $building, $cost, $nextLevel, $isInstant, $finishesAt): bool {
            $lockedPlayer = Player::whereKey($player->id)->lockForUpdate()->first();

            if (
                $lockedPlayer->gold < $cost['gold']
                || $lockedPlayer->wood < $cost['wood']
                || $lockedPlayer->stone < $cost['stone']
                || $lockedPlayer->iron < $cost['iron']
            ) {
                return false;
            }

            $lockedPlayer->decrement('gold', $cost['gold']);
            $lockedPlayer->decrement('wood', $cost['wood']);
            $lockedPlayer->decrement('stone', $cost['stone']);
            $lockedPlayer->decrement('iron', $cost['iron']);

            if ($isInstant) {
                $building->update(['level' => $nextLevel]);
                CityState::applyProduction($city, $building->buildingType->key);
            } else {
                $building->update([
                    'upgrade_started_at' => now(),
                    'upgrade_finishes_at' => $finishesAt,
                    'upgrade_target_level' => $nextLevel,
                ]);
            }

            return true;
        });

        if (! $sufficient) {
            return response()->json([
                'message' => __('No tienes suficientes recursos para mejorar ese edificio.'),
                'cost' => $cost,
            ], 422);
        }

        if ($isInstant) {
            $building->refresh();

            return response()->json([
                'building' => [
                    'id' => $building->id,
                    'key' => $building->buildingType->key,
                    'level' => $building->level,
                    'upgrading' => false,
                    'upgradeFinishesAt' => null,
                ],
            ]);
        }

        $building->refresh();

        return response()->json([
            'building' => [
                'id' => $building->id,
                'key' => $building->buildingType->key,
                'level' => $building->level,
                'upgrading' => true,
                'upgradeFinishesAt' => $building->upgrade_finishes_at?->toIso8601String(),
                'targetLevel' => $nextLevel,
                'cost' => $cost,
            ],
        ]);
    }

    /**
     * Order a repair for a damaged building.
     *
     * `paid` deduces gold and material and repairs fast (10 % HP/hora);
     * `auto` is free but slow (1,5 % HP/hora).
     */
    public function repair(RepairBuildingRequest $request, City $city, Building $building): JsonResponse
    {
        $data = $request->validated();

        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        if ($city->player_id !== $player->id) {
            return response()->json([
                'message' => __('Esa ciudad no te pertenece.'),
            ], 403);
        }

        if ($building->city_id !== $city->id) {
            return response()->json([
                'message' => __('Ese edificio no pertenece a esa ciudad.'),
            ], 403);
        }

        if ($building->damage <= 0) {
            return response()->json([
                'message' => __('Ese edificio no tiene daños que reparar.'),
            ], 422);
        }

        if ($building->repair_started_at !== null) {
            return response()->json([
                'message' => __('Ese edificio ya tiene una reparación en curso.'),
            ], 409);
        }

        $paid = $data['type'] === 'paid';

        // El gasto de la reparación pagada sale de los recursos generales del jugador.
        $sufficient = DB::transaction(function () use ($player, $building, $paid): bool {
            if ($paid) {
                $lockedPlayer = Player::whereKey($player->id)->lockForUpdate()->first();
                $cost = BuildingRepair::cost($building);

                if (
                    $lockedPlayer->gold < $cost['gold']
                    || $lockedPlayer->{$cost['repair_material']} < $cost['material_amount']
                ) {
                    return false;
                }

                $lockedPlayer->decrement('gold', $cost['gold']);
                $lockedPlayer->decrement($cost['repair_material'], $cost['material_amount']);
            }

            $building->update([
                'repair_started_at' => now(),
                'repair_paid' => $paid,
            ]);

            return true;
        });

        if (! $sufficient) {
            return response()->json([
                'message' => __('No tienes suficientes recursos para reparar ese edificio.'),
            ], 422);
        }

        return response()->json([
            'building' => [
                'key' => $building->buildingType->key,
                'damage' => $building->damage,
                'repairing' => true,
                'repairPaid' => $paid,
            ],
        ]);
    }
}
