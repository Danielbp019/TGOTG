<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Http\Requests\JoinClanRequest;
use App\Http\Requests\StoreClanRequest;
use App\Models\Clan;
use App\Models\ClanApplication;
use App\Models\ClanMember;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClanController extends Controller
{
    use ResolvesCurrentPlayer;

    /**
     * Lista todos los clanes disponibles (para jugadores sin clan).
     */
    public function index(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para ver los clanes.'),
            ], 422);
        }

        $clans = Clan::withCount('members')
            ->with('leader')
            ->get();

        return response()->json([
            'clans' => $clans->map(fn (Clan $clan) => [
                'id' => $clan->id,
                'name' => $clan->name,
                'acronym' => $clan->acronym,
                'leader' => [
                    'id' => $clan->leader->id,
                    'nick' => $clan->leader->nick,
                ],
                'memberCount' => $clan->members_count,
                'maxMembers' => config('game_balance.clan.max_members', 20),
            ]),
        ]);
    }

    /**
     * Crea un nuevo clan.
     */
    public function store(StoreClanRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $player = $this->currentPlayer($userId);

        if ($player === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para crear un clan.'),
            ], 422);
        }

        if ($player->clan_id !== null) {
            return response()->json([
                'message' => __('Ya perteneces a un clan. Debes abandonarlo primero.'),
            ], 422);
        }

        $data = $request->validated();

        $clan = DB::transaction(function () use ($data, $userId, $player) {
            $clan = Clan::create([
                'name' => $data['name'],
                'acronym' => $data['acronym'],
                'leader_id' => $userId,
            ]);

            ClanMember::create([
                'clan_id' => $clan->id,
                'player_id' => $player->id,
                'role' => 'leader',
                'joined_at' => now(),
            ]);

            $player->update(['clan_id' => $clan->id]);

            return $clan;
        });

        $clan->load('leader', 'members.player.user');

        return response()->json([
            'clan' => $this->clanPayload($clan),
        ], 201);
    }

    /**
     * Muestra el clan del jugador actual.
     */
    public function my(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para ver tu clan.'),
            ], 422);
        }

        if ($player->clan_id === null) {
            return response()->json([
                'clan' => null,
            ]);
        }

        $clan = Clan::with('leader', 'members.player.user', 'bulletins.author')
            ->findOrFail($player->clan_id);

        return response()->json([
            'clan' => $this->clanDetailPayload($clan, $player),
        ]);
    }

    /**
     * Muestra el detalle de un clan específico.
     */
    public function show(Clan $clan): JsonResponse
    {
        $clan->load('leader', 'members.player.user');

        return response()->json([
            'clan' => $this->clanPayload($clan),
        ]);
    }

    /**
     * Solicita unirse a un clan.
     */
    public function join(JoinClanRequest $request, Clan $clan): JsonResponse
    {
        $userId = $request->user()->id;
        $player = $this->currentPlayer($userId);

        if ($player === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para unirte a un clan.'),
            ], 422);
        }

        if ($player->clan_id !== null) {
            return response()->json([
                'message' => __('Ya perteneces a un clan. Debes abandonarlo primero.'),
            ], 422);
        }

        if ($clan->hasMember($player->id)) {
            return response()->json([
                'message' => __('Ya eres miembro de este clan.'),
            ], 422);
        }

        if ($clan->memberCount() >= config('game_balance.clan.max_members', 20)) {
            return response()->json([
                'message' => __('Este clan está lleno.'),
            ], 422);
        }

        $applicationsIn24h = ClanApplication::where('player_id', $player->id)
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        if ($applicationsIn24h >= config('game_balance.clan.max_applications_per_24h', 3)) {
            return response()->json([
                'message' => __('Has alcanzado el límite de solicitudes por 24 horas.'),
            ], 422);
        }

        $existingApplication = ClanApplication::where('player_id', $player->id)
            ->where('status', 'pending')
            ->first();

        if ($existingApplication !== null) {
            return response()->json([
                'message' => __('Ya tienes una solicitud pendiente.'),
            ], 422);
        }

        $application = ClanApplication::create([
            'clan_id' => $clan->id,
            'player_id' => $player->id,
            'message' => $request->input('message'),
            'status' => 'pending',
        ]);

        return response()->json([
            'application' => [
                'id' => $application->id,
                'status' => $application->status,
                'createdAt' => $application->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Abandona el clan actual.
     */
    public function leave(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para abandonar un clan.'),
            ], 422);
        }

        if ($player->clan_id === null) {
            return response()->json([
                'message' => __('No perteneces a ningún clan.'),
            ], 422);
        }

        $clanMember = ClanMember::where('player_id', $player->id)->first();

        if ($clanMember === null) {
            return response()->json([
                'message' => __('No se encontró tu registro de miembro.'),
            ], 422);
        }

        $daysSinceJoin = $clanMember->joined_at->diffInDays(now());

        if ($daysSinceJoin < config('game_balance.clan.min_days_to_leave', 3)) {
            $daysRemaining = config('game_balance.clan.min_days_to_leave', 3) - $daysSinceJoin;

            return response()->json([
                'message' => __('Debes esperar :days días más para abandonar el clan.', ['days' => $daysRemaining]),
            ], 422);
        }

        if ($clanMember->role === 'leader') {
            return response()->json([
                'message' => __('El líder no puede abandonar el clan. Debe disbolverlo o transferir el liderazgo.'),
            ], 422);
        }

        DB::transaction(function () use ($player, $clanMember) {
            $clanMember->delete();
            $player->update(['clan_id' => null]);
        });

        return response()->json([
            'message' => __('Has abandonado el clan.'),
        ]);
    }

    /**
     * Disuelve el clan (solo el líder).
     */
    public function destroy(Request $request, Clan $clan): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('Debes estar en la contienda para disbolver un clan.'),
            ], 422);
        }

        if ($clan->leader_id !== $request->user()->id) {
            return response()->json([
                'message' => __('Solo el líder puede disbolver el clan.'),
            ], 403);
        }

        $clanMember = ClanMember::where('player_id', $player->id)->first();

        if ($clanMember === null) {
            return response()->json([
                'message' => __('No se encontró tu registro de miembro.'),
            ], 422);
        }

        $daysSinceJoin = $clanMember->joined_at->diffInDays(now());

        if ($daysSinceJoin < config('game_balance.clan.min_days_to_disband', 3)) {
            $daysRemaining = config('game_balance.clan.min_days_to_disband', 3) - $daysSinceJoin;

            return response()->json([
                'message' => __('Debes esperar :days días más para disbolver el clan.', ['days' => $daysRemaining]),
            ], 422);
        }

        DB::transaction(function () use ($clan) {
            Player::where('clan_id', $clan->id)->update(['clan_id' => null]);
            $clan->delete();
        });

        return response()->json([
            'message' => __('El clan ha sido disbuelto.'),
        ]);
    }

    /**
     * Obtiene las solicitudes pendientes de un clan.
     */
    public function applications(Request $request, Clan $clan): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasMember($player->id)) {
            return response()->json([
                'message' => __('No tienes acceso a este clan.'),
            ], 403);
        }

        $applications = ClanApplication::where('clan_id', $clan->id)
            ->where('status', 'pending')
            ->with('player.user')
            ->get();

        return response()->json([
            'applications' => $applications->map(fn (ClanApplication $app) => [
                'id' => $app->id,
                'player' => [
                    'id' => $app->player->id,
                    'nick' => $app->player->user->nick,
                ],
                'message' => $app->message,
                'createdAt' => $app->created_at->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Acepta una solicitud de unión.
     */
    public function acceptApplication(Request $request, Clan $clan, ClanApplication $application): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasAdminPermission($player->id)) {
            return response()->json([
                'message' => __('No tienes permisos para aceptar solicitudes.'),
            ], 403);
        }

        if ($application->clan_id !== $clan->id) {
            return response()->json([
                'message' => __('La solicitud no pertenece a este clan.'),
            ], 422);
        }

        if ($application->status !== 'pending') {
            return response()->json([
                'message' => __('Esta solicitud ya fue procesada.'),
            ], 422);
        }

        if ($clan->memberCount() >= config('game_balance.clan.max_members', 20)) {
            return response()->json([
                'message' => __('El clan está lleno.'),
            ], 422);
        }

        $applicantPlayer = Player::find($application->player_id);

        if ($applicantPlayer === null || $applicantPlayer->clan_id !== null) {
            return response()->json([
                'message' => __('El jugador ya pertenece a un clan.'),
            ], 422);
        }

        DB::transaction(function () use ($clan, $application, $applicantPlayer) {
            ClanMember::create([
                'clan_id' => $clan->id,
                'player_id' => $applicantPlayer->id,
                'role' => 'member',
                'joined_at' => now(),
            ]);

            $applicantPlayer->update(['clan_id' => $clan->id]);

            ClanApplication::where('player_id', $applicantPlayer->id)
                ->where('status', 'pending')
                ->update(['status' => 'accepted']);

            $application->update(['status' => 'accepted']);
        });

        return response()->json([
            'message' => __('Solicitud aceptada.'),
        ]);
    }

    /**
     * Rechaza una solicitud de unión.
     */
    public function rejectApplication(Request $request, Clan $clan, ClanApplication $application): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null || ! $clan->hasAdminPermission($player->id)) {
            return response()->json([
                'message' => __('No tienes permisos para rechazar solicitudes.'),
            ], 403);
        }

        if ($application->clan_id !== $clan->id) {
            return response()->json([
                'message' => __('La solicitud no pertenece a este clan.'),
            ], 422);
        }

        if ($application->status !== 'pending') {
            return response()->json([
                'message' => __('Esta solicitud ya fue procesada.'),
            ], 422);
        }

        $application->update(['status' => 'rejected']);

        return response()->json([
            'message' => __('Solicitud rechazada.'),
        ]);
    }

    /**
     * @return array{id: string, name: string, acronym: string, leader: array{id: string, nick: string}, memberCount: int, maxMembers: int}
     */
    private function clanPayload(Clan $clan): array
    {
        return [
            'id' => $clan->id,
            'name' => $clan->name,
            'acronym' => $clan->acronym,
            'leader' => [
                'id' => $clan->leader->id,
                'nick' => $clan->leader->nick,
            ],
            'memberCount' => $clan->members->count(),
            'maxMembers' => config('game_balance.clan.max_members', 20),
        ];
    }

    /**
     * @return array{id: string, name: string, acronym: string, leader: array{id: string, nick: string}, members: array<int, array{id: string, nick: string, role: string, joinedAt: string}>, bulletins: array<int, array{id: string, title: string, content: string, author: array{id: string, nick: string}, createdAt: string}>, memberCount: int, maxMembers: int}
     */
    private function clanDetailPayload(Clan $clan, Player $currentPlayer): array
    {
        $currentMember = $clan->members->firstWhere('player_id', $currentPlayer->id);

        return [
            'id' => $clan->id,
            'name' => $clan->name,
            'acronym' => $clan->acronym,
            'leader' => [
                'id' => $clan->leader->id,
                'nick' => $clan->leader->nick,
            ],
            'members' => $clan->members->map(fn (ClanMember $member) => [
                'id' => $member->player->id,
                'nick' => $member->player->user->nick,
                'role' => $member->role,
                'joinedAt' => $member->joined_at->toIso8601String(),
            ])->values()->all(),
            'bulletins' => $clan->bulletins->map(fn ($bulletin) => [
                'id' => $bulletin->id,
                'title' => $bulletin->title,
                'content' => $bulletin->content,
                'author' => [
                    'id' => $bulletin->author->id,
                    'nick' => $bulletin->author->nick,
                ],
                'createdAt' => $bulletin->created_at->toIso8601String(),
            ])->values()->all(),
            'memberCount' => $clan->members->count(),
            'maxMembers' => config('game_balance.clan.max_members', 20),
            'currentUserRole' => $currentMember?->role,
        ];
    }
}
