<?php

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('las conversaciones requieren autenticación', function () {
    $this->getJson('/api/conversations')->assertStatus(401);
    $this->postJson('/api/conversations', [])->assertStatus(401);
});

test('lista solo las conversaciones del usuario en la contienda actual', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $other = User::factory()->create(['nick' => 'Tláloc']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $other->id]);

    $stranger = User::factory()->create(['nick' => 'Ajeno']);
    $otherWorld = World::factory()->create(['status' => 'running']);

    $mine = Conversation::factory()->create([
        'world_id' => $world->id,
        'user_one_id' => $user->id,
        'user_two_id' => $other->id,
    ]);
    Message::factory()->create([
        'conversation_id' => $mine->id,
        'sender_id' => $other->id,
        'body' => 'Saludos',
        'read_at' => null,
        'created_at' => now()->subHour(),
    ]);
    $mine->update(['last_message_at' => now()->subHour()]);

    Conversation::factory()->create([
        'world_id' => $world->id,
        'user_one_id' => $other->id,
        'user_two_id' => $stranger->id,
    ]);

    Conversation::factory()->create([
        'world_id' => $otherWorld->id,
        'user_one_id' => $user->id,
        'user_two_id' => $stranger->id,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/conversations')
        ->assertStatus(200)
        ->assertJsonCount(1, 'conversations')
        ->assertJsonPath('conversations.0.id', $mine->id)
        ->assertJsonPath('conversations.0.participant.nick', 'Tláloc')
        ->assertJsonPath('conversations.0.lastMessage.body', 'Saludos')
        ->assertJsonPath('conversations.0.lastMessage.fromMe', false)
        ->assertJsonPath('conversations.0.unreadCount', 1);
});

test('leer una conversación devuelve los mensajes y marca los ajenos como leídos', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $other = User::factory()->create(['nick' => 'Mictlantecuhtli']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $other->id]);

    $conversation = Conversation::factory()->create([
        'world_id' => $world->id,
        'user_one_id' => $user->id,
        'user_two_id' => $other->id,
    ]);
    $incoming = Message::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $other->id,
        'body' => 'Hola',
        'read_at' => null,
    ]);
    $outgoing = Message::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $user->id,
        'body' => '¿Qué tal?',
        'read_at' => null,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/conversations/{$conversation->id}")
        ->assertStatus(200)
        ->assertJsonCount(2, 'conversation.messages')
        ->assertJsonPath('conversation.messages.0.id', $incoming->id)
        ->assertJsonPath('conversation.messages.0.fromMe', false)
        ->assertJsonPath('conversation.messages.1.fromMe', true);

    $this->assertDatabaseHas('messages', [
        'id' => $incoming->id,
        'read_at' => now(),
    ]);
});

test('no se puede leer una conversación ajena o de otro mundo', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);

    $other = User::factory()->create();
    $conversation = Conversation::factory()->create([
        'world_id' => $world->id,
        'user_one_id' => $other->id,
        'user_two_id' => User::factory()->create()->id,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/conversations/{$conversation->id}")
        ->assertStatus(404);
});

test('se crea una conversación con un dios de la contienda y su primer mensaje', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $other = User::factory()->create(['nick' => 'Tláloc']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $other->id]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/conversations', [
            'recipient_nick' => 'Tláloc',
            'body' => '¿Alianza?',
        ])->assertStatus(201)
        ->assertJsonPath('conversation.participant.nick', 'Tláloc')
        ->assertJsonCount(1, 'conversation.messages')
        ->assertJsonPath('conversation.messages.0.body', '¿Alianza?')
        ->assertJsonPath('conversation.messages.0.fromMe', true);

    $this->assertDatabaseCount('conversations', 1);
    $this->assertDatabaseCount('messages', 1);
});

test('no se puede crear una conversación con un dios inexistente o fuera de la contienda', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    User::factory()->create(['nick' => 'Forastero']);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/conversations', [
            'recipient_nick' => 'Forastero',
            'body' => 'Hola',
        ])->assertStatus(422);
});

test('un usuario fuera de la contienda no puede escribir mensajes', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/conversations', [
            'recipient_nick' => 'Tláloc',
            'body' => 'Hola',
        ])->assertStatus(422);
});

test('enviar un mensaje lo añade y actualiza el último mensaje', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $other = User::factory()->create();
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $other->id]);

    $conversation = Conversation::factory()->create([
        'world_id' => $world->id,
        'user_one_id' => $user->id,
        'user_two_id' => $other->id,
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/conversations/{$conversation->id}/messages", [
            'body' => 'Un mensaje más',
        ])->assertStatus(201)
        ->assertJsonCount(1, 'conversation.messages')
        ->assertJsonPath('conversation.messages.0.body', 'Un mensaje más');

    $this->assertDatabaseHas('conversations', [
        'id' => $conversation->id,
        'last_message_at' => now(),
    ]);
});

test('se elimina una conversación propia', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $other = User::factory()->create();
    $conversation = Conversation::factory()->create([
        'world_id' => $world->id,
        'user_one_id' => $user->id,
        'user_two_id' => $other->id,
    ]);
    Message::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $other->id]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/conversations/{$conversation->id}")
        ->assertStatus(200);

    $this->assertDatabaseCount('conversations', 0);
    $this->assertDatabaseCount('messages', 0);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/conversations')
        ->assertJsonCount(0, 'conversations');
});

test('no se puede eliminar una conversación ajena', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);

    $other = User::factory()->create();
    $conversation = Conversation::factory()->create([
        'world_id' => $world->id,
        'user_one_id' => $other->id,
        'user_two_id' => User::factory()->create()->id,
    ]);

    $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/conversations/{$conversation->id}")
        ->assertStatus(404);
});
