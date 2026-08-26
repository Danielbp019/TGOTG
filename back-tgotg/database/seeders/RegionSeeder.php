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
                // Polígonos en espacio 2048×1024, siguiendo las fronteras del arte mapaGlobal2048x1024.jpg.
                'polygon' => [
                    471, 51, 665, 25, 707, 154, 717, 307, 722, 399, 655, 430,
                    573, 461, 502, 481, 466, 512, 441, 543, 400, 530, 378, 410,
                    379, 256, 410, 123,
                ],
                'sort_order' => 1,
                'biomes' => ['bosque', 'colinaRica', 'costa'],
            ],
            [
                'key' => 'region2',
                'label' => 'Región 2',
                'polygon' => [
                    665, 25, 1244, 26, 1252, 123, 1254, 256, 1259, 384,
                    1136, 389, 973, 379, 850, 389, 722, 399, 717, 307, 707, 154,
                ],
                'sort_order' => 2,
                'biomes' => ['pradera', 'bosque', 'colinaRica'],
            ],
            [
                'key' => 'region3',
                'label' => 'Región 3',
                'polygon' => [
                    1244, 26, 1536, 26, 1690, 51, 1720, 154, 1741, 307,
                    1690, 481, 1598, 466, 1485, 456, 1383, 430, 1259, 384,
                    1254, 256, 1252, 123,
                ],
                'sort_order' => 3,
                'biomes' => ['montaña', 'bosque', 'costa'],
            ],
            [
                'key' => 'region4',
                'label' => 'Región 4',
                'polygon' => [
                    722, 399, 850, 389, 973, 379, 1136, 389, 1259, 384,
                    1383, 430, 1485, 456, 1598, 466, 1659, 573, 1485, 599,
                    1331, 604, 1259, 614, 1126, 666, 1024, 707, 911, 738,
                    880, 748, 829, 681, 788, 625, 737, 573, 727, 481,
                ],
                'sort_order' => 4,
                'biomes' => ['montaña', 'colinaRica', 'pradera'],
            ],
            [
                'key' => 'region5',
                'label' => 'Región 5',
                'polygon' => [
                    400, 530, 441, 543, 466, 512, 502, 481, 573, 461, 655, 430,
                    722, 399, 727, 481, 737, 573, 788, 625, 829, 681, 880, 748,
                    870, 799, 860, 840, 737, 860, 614, 850, 492, 829, 399, 799,
                    327, 748, 286, 686, 306, 614, 358, 563,
                ],
                'sort_order' => 5,
                'biomes' => ['bosque', 'pradera', 'colinaRica'],
            ],
            [
                'key' => 'region6',
                'label' => 'Región 6',
                'polygon' => [
                    880, 748, 911, 738, 1024, 707, 1126, 666, 1259, 614,
                    1331, 604, 1485, 599, 1659, 573, 1700, 625, 1680, 676,
                    1639, 778, 1578, 860, 1456, 880, 1334, 870, 1212, 840,
                    1126, 788, 1024, 738, 962, 748,
                ],
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
