<?php

namespace Database\Factories;

use App\Models\World;
use App\Models\WorldReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorldReport>
 */
class WorldReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'world_id' => World::factory(),
            'stats' => [
                'winner' => null,
                'players' => 0,
                'total_gold' => 0,
            ],
            'finished_at' => now(),
        ];
    }
}
