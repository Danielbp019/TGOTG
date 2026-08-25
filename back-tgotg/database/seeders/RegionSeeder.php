<?php

namespace Database\Seeders;

use App\Models\Biome;
use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $definitions = [
            [
                'key' => 'region1',
                'label' => 'Región 1',
                'polygon' => [100, 100, 400, 100, 400, 300, 100, 300],
                'sort_order' => 1,
                'biomes' => ['bosque', 'colinaRica', 'costa'],
            ],
            [
                'key' => 'region2',
                'label' => 'Región 2',
                'polygon' => [450, 100, 750, 100, 750, 300, 450, 300],
                'sort_order' => 2,
                'biomes' => ['pradera', 'bosque', 'colinaRica'],
            ],
            [
                'key' => 'region3',
                'label' => 'Región 3',
                'polygon' => [800, 100, 1100, 100, 1100, 300, 800, 300],
                'sort_order' => 3,
                'biomes' => ['montaña', 'bosque', 'costa'],
            ],
            [
                'key' => 'region4',
                'label' => 'Región 4',
                'polygon' => [100, 400, 400, 400, 400, 600, 100, 600],
                'sort_order' => 4,
                'biomes' => ['montaña', 'colinaRica', 'pradera'],
            ],
            [
                'key' => 'region5',
                'label' => 'Región 5',
                'polygon' => [450, 400, 750, 400, 750, 600, 450, 600],
                'sort_order' => 5,
                'biomes' => ['bosque', 'pradera', 'colinaRica'],
            ],
            [
                'key' => 'region6',
                'label' => 'Región 6',
                'polygon' => [800, 400, 1100, 400, 1100, 600, 800, 600],
                'sort_order' => 6,
                'biomes' => ['pradera', 'montaña', 'costa'],
            ],
        ];

        $biomesByKey = Biome::all()->keyBy('key');

        foreach ($definitions as $def) {
            $region = Region::updateOrCreate(
                ['key' => $def['key']],
                [
                    'label' => $def['label'],
                    'polygon' => $def['polygon'],
                    'sort_order' => $def['sort_order'],
                ]
            );

            $biomeIds = collect($def['biomes'])
                ->map(fn (string $key) => $biomesByKey->get($key)?->id)
                ->filter()
                ->all();

            $region->biomes()->sync($biomeIds);
        }
    }
}
