<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Biome;
use App\Models\Region;
use Illuminate\Http\JsonResponse;

class RegionController extends Controller
{
    public function index(): JsonResponse
    {
        $regions = Region::with('biomes')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Region $region) => [
                'id' => $region->id,
                'key' => $region->key,
                'label' => $region->label,
                'polygon' => $region->polygon,
                'sortOrder' => $region->sort_order,
                'biomes' => $region->biomes->map(fn (Biome $b) => [
                    'id' => $b->id,
                    'key' => $b->key,
                    'label' => $b->label,
                    'description' => $b->description,
                    'bonusResource' => $b->bonus_resource,
                    'bonusValue' => (float) $b->bonus_value,
                ])->values(),
            ]);

        return response()->json(['regions' => $regions]);
    }

    public function biomes(): JsonResponse
    {
        $biomes = Biome::orderBy('key')->get()->map(fn (Biome $b) => [
            'id' => $b->id,
            'key' => $b->key,
            'label' => $b->label,
            'description' => $b->description,
            'bonusResource' => $b->bonus_resource,
            'bonusValue' => (float) $b->bonus_value,
        ]);

        return response()->json(['biomes' => $biomes]);
    }
}
