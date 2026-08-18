<?php

namespace Database\Seeders;

use App\Models\GameOption;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GameOptionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the available game options for world creation.
     */
    public function run(): void
    {
        $options = [
            [
                'type' => GameOption::TYPE_DURATION,
                'key' => 'rapida',
                'label' => 'Rápida',
                'value' => 7,
                'description' => 'Una contienda breve e intensa para los que buscan acción inmediata.',
                'sort_order' => 1,
            ],
            [
                'type' => GameOption::TYPE_DURATION,
                'key' => 'normal',
                'label' => 'Normal',
                'value' => 30,
                'description' => 'El equilibrio clásico entre paciencia y estrategia.',
                'sort_order' => 2,
            ],
            [
                'type' => GameOption::TYPE_DURATION,
                'key' => 'epica',
                'label' => 'Épica',
                'value' => 90,
                'description' => 'Una campaña larga donde cada decisión forja un legado.',
                'sort_order' => 3,
            ],
            [
                'type' => GameOption::TYPE_MULTIPLIER,
                'key' => 'x1',
                'label' => '1x',
                'value' => 1,
                'description' => 'Producción y tiempos de construcción estándar.',
                'sort_order' => 1,
            ],
            [
                'type' => GameOption::TYPE_MULTIPLIER,
                'key' => 'x2',
                'label' => '2x',
                'value' => 2,
                'description' => 'Producción y tiempos acelerados.',
                'sort_order' => 2,
            ],
            [
                'type' => GameOption::TYPE_MULTIPLIER,
                'key' => 'x3',
                'label' => '3x',
                'value' => 3,
                'description' => 'Un ritmo frenético para no esperar demasiado.',
                'sort_order' => 3,
            ],
        ];

        foreach ($options as $option) {
            GameOption::updateOrCreate(['key' => $option['key']], $option);
        }
    }
}
