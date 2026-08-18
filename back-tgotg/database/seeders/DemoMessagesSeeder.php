<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoMessagesSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed demo gods with conversations for the running world.
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

        $gods = [
            [
                'nick' => 'Tláloc',
                'email' => 'tlaloc@example.com',
                'messages' => [
                    ['from' => 'god', 'read' => true, 'at' => '2026-08-15T09:20:00', 'body' => 'Saludos, Dios Supremo. He visto que tu civilización avanza con rapidez.'],
                    ['from' => 'admin', 'read' => true, 'at' => '2026-08-15T09:35:00', 'body' => 'Así es. Estoy reforzando mi ciudad antes de expandirme.'],
                    ['from' => 'god', 'read' => false, 'at' => '2026-08-17T11:05:00', 'body' => 'Sabia decisión. El oeste está repleto de recursos, pero también de enemigos.'],
                    ['from' => 'god', 'read' => false, 'at' => '2026-08-17T11:06:00', 'body' => '¿Te interesaría una alianza comercial? Mi granja produce más de lo que necesito.'],
                ],
            ],
            [
                'nick' => 'Mictlantecuhtli',
                'email' => 'mictlantecuhtli@example.com',
                'messages' => [
                    ['from' => 'god', 'read' => true, 'at' => '2026-08-12T18:40:00', 'body' => 'Tus murallas impresionan. ¿Planeas atacarme o defenderte de alguien más?'],
                    ['from' => 'admin', 'read' => true, 'at' => '2026-08-12T19:10:00', 'body' => 'Solo me protejo. Mis intereses están en el norte.'],
                ],
            ],
            [
                'nick' => 'Huitzilopochtli',
                'email' => 'huitzilopochtli@example.com',
                'messages' => [
                    ['from' => 'admin', 'read' => true, 'at' => '2026-08-10T14:00:00', 'body' => 'Necesito hierro para equipar a mi ejército. ¿Alguien comercia?'],
                    ['from' => 'god', 'read' => true, 'at' => '2026-08-10T15:25:00', 'body' => 'Yo tengo de sobra. Envíame tu oferta y negociamos.'],
                ],
            ],
        ];

        foreach ($gods as $god) {
            $user = User::firstOrCreate(
                ['email' => $god['email']],
                ['nick' => $god['nick'], 'role' => 'player', 'password' => Hash::make('password')]
            );

            Player::firstOrCreate(
                ['world_id' => $world->id, 'user_id' => $user->id],
                ['gold' => 8000, 'wood' => 5400, 'stone' => 3800, 'iron' => 2600, 'food' => 6100]
            );

            $conversation = Conversation::firstOrCreate(
                ['world_id' => $world->id, 'user_one_id' => $admin->id, 'user_two_id' => $user->id]
            );

            if ($conversation->messages()->exists()) {
                continue;
            }

            $lastMessage = null;
            foreach ($god['messages'] as $item) {
                $senderId = $item['from'] === 'admin' ? $admin->id : $user->id;
                $at = $item['at'];

                $message = new Message([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $senderId,
                    'body' => $item['body'],
                ]);
                $message->created_at = $at;
                $message->updated_at = $at;
                if ($item['read']) {
                    $message->read_at = $at;
                }
                $message->save();

                $lastMessage = $message;
            }

            if ($lastMessage !== null) {
                $conversation->update(['last_message_at' => $lastMessage->created_at]);
            }
        }
    }
}
