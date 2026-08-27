<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClanBulletinRequest;
use App\Models\Clan;
use App\Models\ClanBulletin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClanBulletinController extends Controller
{
    use ResolvesCurrentPlayer;

    /**
     * Lista las publicaciones del tablón del clan.
     */
    public function index(Request $request, Clan $clan): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasMember($player->id)) {
            return response()->json([
                'message' => __('No tienes acceso a este clan.'),
            ], 403);
        }

        $bulletins = ClanBulletin::where('clan_id', $clan->id)
            ->with('author')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'bulletins' => $bulletins->map(fn (ClanBulletin $bulletin) => [
                'id' => $bulletin->id,
                'title' => $bulletin->title,
                'content' => $bulletin->content,
                'author' => [
                    'id' => $bulletin->author->id,
                    'nick' => $bulletin->author->nick,
                ],
                'createdAt' => $bulletin->created_at->toIso8601String(),
            ])->values()->all(),
        ]);
    }

    /**
     * Crea una nueva publicación en el tablón.
     */
    public function store(StoreClanBulletinRequest $request, Clan $clan): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasAdminPermission($player->id)) {
            return response()->json([
                'message' => __('No tienes permisos para publicar en el tablón.'),
            ], 403);
        }

        $data = $request->validated();

        $bulletin = ClanBulletin::create([
            'clan_id' => $clan->id,
            'author_id' => $request->user()->id,
            'title' => $data['title'],
            'content' => $data['content'],
        ]);

        $bulletin->load('author');

        return response()->json([
            'bulletin' => [
                'id' => $bulletin->id,
                'title' => $bulletin->title,
                'content' => $bulletin->content,
                'author' => [
                    'id' => $bulletin->author->id,
                    'nick' => $bulletin->author->nick,
                ],
                'createdAt' => $bulletin->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Actualiza una publicación del tablón.
     */
    public function update(StoreClanBulletinRequest $request, Clan $clan, ClanBulletin $bulletin): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasAdminPermission($player->id)) {
            return response()->json([
                'message' => __('No tienes permisos para editar publicaciones.'),
            ], 403);
        }

        if ($bulletin->clan_id !== $clan->id) {
            return response()->json([
                'message' => __('Esta publicación no pertenece a tu clan.'),
            ], 403);
        }

        $data = $request->validated();

        $bulletin->update([
            'title' => $data['title'],
            'content' => $data['content'],
        ]);

        $bulletin->load('author');

        return response()->json([
            'bulletin' => [
                'id' => $bulletin->id,
                'title' => $bulletin->title,
                'content' => $bulletin->content,
                'author' => [
                    'id' => $bulletin->author->id,
                    'nick' => $bulletin->author->nick,
                ],
                'createdAt' => $bulletin->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Elimina una publicación del tablón.
     */
    public function destroy(Request $request, Clan $clan, ClanBulletin $bulletin): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasAdminPermission($player->id)) {
            return response()->json([
                'message' => __('No tienes permisos para eliminar publicaciones.'),
            ], 403);
        }

        if ($bulletin->clan_id !== $clan->id) {
            return response()->json([
                'message' => __('Esta publicación no pertenece a tu clan.'),
            ], 403);
        }

        $bulletin->delete();

        return response()->json([
            'message' => __('Publicación eliminada.'),
        ]);
    }
}
