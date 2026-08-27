<?php

namespace App\Http\Resources;

use App\Support\BuildingCosts;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BuildingTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'max_level' => $this->max_level,
            'gold_cost' => $this->gold_cost,
            'wood_cost' => $this->wood_cost,
            'stone_cost' => $this->stone_cost,
            'iron_cost' => $this->iron_cost,
            'base_minutes' => $this->base_minutes,
            'repair_material' => $this->repair_material,
            'levels' => collect(range(1, (int) $this->max_level))
                ->map(fn (int $level) => BuildingCosts::costForLevel($this->resource, $level))
                ->values(),
        ];
    }
}
