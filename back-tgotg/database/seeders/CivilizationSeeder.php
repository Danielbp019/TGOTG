<?php

namespace Database\Seeders;

use App\Models\Civilization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CivilizationSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the initial civilizations.
     *
     * El bono mecánico vive en el campo JSON `bonus`:
     * - production_bonus: mapa recurso => % de producción
     * - attack_bonus: % de poder de ataque
     * - defense_bonus: % de defensa de las ciudades
     */
    public function run(): void
    {
        $civilizations = [
            [
                'key' => 'humanos',
                'name' => 'Humanos',
                'description' => 'Una raza versátil que prospera en cualquier terreno. Ni los mejores ni los peores en nada.',
                'benefit' => '+5 % a todos los recursos',
                'bonus' => [
                    'production_bonus' => [
                        'gold' => 5,
                        'wood' => 5,
                        'stone' => 5,
                        'iron' => 5,
                        'food' => 5,
                    ],
                ],
            ],
            [
                'key' => 'elfos',
                'name' => 'Elfos',
                'description' => 'Hijos del bosque, sus campos y bosques producen como si la naturaleza les sirviera.',
                'benefit' => '+15 % comida y madera',
                'bonus' => [
                    'production_bonus' => [
                        'food' => 15,
                        'wood' => 15,
                    ],
                ],
            ],
            [
                'key' => 'orcos',
                'name' => 'Orcos',
                'description' => 'Belicosos por naturaleza, sus guerreros luchan con una ferocidad inigualable.',
                'benefit' => '+15 % poder de ataque',
                'bonus' => [
                    'attack_bonus' => 15,
                ],
            ],
            [
                'key' => 'enanos',
                'name' => 'Enanos',
                'description' => 'Forjadores de la montaña, extraen minerales y defienden sus fortalezas como nadie.',
                'benefit' => '+10 % piedra y hierro, +10 % defensa',
                'bonus' => [
                    'production_bonus' => [
                        'stone' => 10,
                        'iron' => 10,
                    ],
                    'defense_bonus' => 10,
                ],
            ],
        ];

        foreach ($civilizations as $civilization) {
            Civilization::updateOrCreate(['key' => $civilization['key']], $civilization);
        }
    }
}
