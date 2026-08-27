<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'name' => $this->name,
            'tier' => $this->tier,
            'description' => $this->description,
            'attack' => $this->attack,
            'defense' => $this->defense,
            'gold_cost' => $this->gold_cost,
            'food_cost' => $this->food_cost,
            'iron_cost' => $this->iron_cost,
            'food_upkeep' => (float) $this->food_upkeep,
            'training_minutes' => $this->training_minutes,
            'required_barracks_level' => $this->required_barracks_level,
            'civilization' => $this->whenLoaded('civilization', fn () => [
                'key' => $this->civilization->key,
                'name' => $this->civilization->name,
            ]),
        ];
    }
}
