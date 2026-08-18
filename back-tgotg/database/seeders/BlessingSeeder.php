<?php

namespace Database\Seeders;

use App\Models\Blessing;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BlessingSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the initial god blessings.
     */
    public function run(): void
    {
        $blessings = [
            [
                'key' => 'cosecha-abundante',
                'name' => 'Cosecha abundante',
                'benefit' => '+10 % producción de comida',
                'description' => 'Los campos de tu civilización rinden como nunca.',
            ],
            [
                'key' => 'forja-implacable',
                'name' => 'Forja implacable',
                'benefit' => '+10 % madera, piedra y hierro',
                'description' => 'Los mineros y leñadores trabajan sin descanso.',
            ],
            [
                'key' => 'hijos-de-la-guerra',
                'name' => 'Hijos de la guerra',
                'benefit' => '+10 % poder de ataque',
                'description' => 'Tus tropas luchan con el ardor de los dioses.',
            ],
            [
                'key' => 'muralla-eterna',
                'name' => 'Muralla eterna',
                'benefit' => '+10 % defensa de las ciudades',
                'description' => 'Tus murallas resisten los asedios más feroces.',
            ],
        ];

        foreach ($blessings as $blessing) {
            Blessing::updateOrCreate(['key' => $blessing['key']], $blessing);
        }
    }
}
