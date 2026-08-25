<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Models\Biome;
use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\Region;
use App\Support\CityLayouts;
use App\Support\CityState;
use App\Support\StartingConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

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

    public function store(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            $world = $this->currentWorld();

            if ($world === null) {
                return response()->json([
                    'message' => __('No hay una contienda en curso.'),
                ], 404);
            }

            $player = Player::create([
                'world_id' => $world->id,
                'user_id' => $request->user()->id,
                'gold' => StartingConfig::cityValues()['gold'],
                'wood' => StartingConfig::cityValues()['wood'],
                'stone' => StartingConfig::cityValues()['stone'],
                'iron' => StartingConfig::cityValues()['iron'],
                'food' => StartingConfig::cityValues()['food'],
            ]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:30'],
            'region_id' => ['required', 'uuid', 'exists:regions,id'],
            'biome_id' => ['required', 'uuid', 'exists:biomes,id'],
        ]);

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
}
