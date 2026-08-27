<?php

namespace Database\Seeders;

use App\Models\Clan;
use App\Models\ClanBulletin;
use App\Models\ClanMember;
use App\Models\ClanMessage;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DemoClansSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed demo clans for the running world.
     */
    public function run(): void
    {
        $world = World::where('status', 'running')->first();

        if ($world === null) {
            return;
        }

        $admin = User::where('email', 'admin@example.com')->first();

        if ($admin === null) {
            return;
        }

        $adminPlayer = Player::where('world_id', $world->id)
            ->where('user_id', $admin->id)
            ->first();

        if ($adminPlayer === null) {
            return;
        }

        $clan1 = Clan::create([
            'name' => 'Guerreros del Alba',
            'acronym' => 'GDA',
            'leader_id' => $admin->id,
        ]);

        ClanMember::create([
            'clan_id' => $clan1->id,
            'player_id' => $adminPlayer->id,
            'role' => 'leader',
            'joined_at' => now()->subDays(5),
        ]);

        $adminPlayer->update(['clan_id' => $clan1->id]);

        ClanBulletin::create([
            'clan_id' => $clan1->id,
            'author_id' => $admin->id,
            'title' => 'Objetivo del clan',
            'content' => 'Expandirnos hacia la Región 3 y asegurar el control de las minas de piedra.',
        ]);

        ClanMessage::create([
            'clan_id' => $clan1->id,
            'sender_id' => $admin->id,
            'body' => '¡Bienvenidos al clan! Recuerden mantener sus edificios actualizados.',
        ]);

        $gods = [
            [
                'nick' => 'Tláloc',
                'email' => 'tlaloc@example.com',
                'role' => 'subleader',
            ],
            [
                'nick' => 'Mictlantecuhtli',
                'email' => 'mictlantecuhtli@example.com',
                'role' => 'officer',
            ],
            [
                'nick' => 'Huitzilopochtli',
                'email' => 'huitzilopochtli@example.com',
                'role' => 'member',
            ],
        ];

        foreach ($gods as $god) {
            $user = User::where('email', $god['email'])->first();

            if ($user === null) {
                continue;
            }

            $player = Player::where('world_id', $world->id)
                ->where('user_id', $user->id)
                ->first();

            if ($player === null) {
                continue;
            }

            ClanMember::create([
                'clan_id' => $clan1->id,
                'player_id' => $player->id,
                'role' => $god['role'],
                'joined_at' => now()->subDays(rand(1, 4)),
            ]);

            $player->update(['clan_id' => $clan1->id]);
        }

        $clan2User = User::firstOrCreate(
            ['email' => 'zeus@example.com'],
            ['nick' => 'Zeus', 'password' => bcrypt('password')]
        );

        $clan2Player = Player::firstOrCreate(
            ['world_id' => $world->id, 'user_id' => $clan2User->id],
            ['gold' => 10000, 'wood' => 8000, 'stone' => 6000, 'iron' => 4000, 'food' => 7000]
        );

        $clan2 = Clan::create([
            'name' => 'Señores del Trueno',
            'acronym' => 'SDT',
            'leader_id' => $clan2User->id,
        ]);

        ClanMember::create([
            'clan_id' => $clan2->id,
            'player_id' => $clan2Player->id,
            'role' => 'leader',
            'joined_at' => now()->subDays(3),
        ]);

        $clan2Player->update(['clan_id' => $clan2->id]);
    }
}
