<?php

namespace App\Support;

class CityLayouts
{
    public const WORLD_SIZE = ['width' => 2048, 'height' => 1024];

    /**
     * @return array{width: int, height: int}
     */
    public static function worldSize(string $map = 'bosque'): array
    {
        return self::WORLD_SIZE;
    }

    /**
     * Parcelas del mapa — (x,y)=vértice sur/bottom-center, ancla sprite 1024×1024.
     * Único SSOT de coordenadas. Front lee vía API /city (shape,x,y,width,height).
     * Para nuevo mapa: añadir case y retornar list distinta.
     *
     * @param  string  $map  Clave de mapa (bosque por defecto). Futuros: desierto, montaña...
     * @return list<array{key: string, level: int, x: int, y: int, shape: string, width: int, height: int}>
     */
    public static function plots(string $map = 'bosque'): array
    {
        return match ($map) {
            default => [
                ['key' => 'ayuntamiento', 'level' => 3, 'x' => 916, 'y' => 336, 'shape' => 'diamond', 'width' => 328, 'height' => 184],
                ['key' => 'granja', 'level' => 2, 'x' => 1376, 'y' => 344, 'shape' => 'diamond', 'width' => 384, 'height' => 200],
                ['key' => 'aserradero', 'level' => 2, 'x' => 1148, 'y' => 480, 'shape' => 'diamond', 'width' => 376, 'height' => 176],
                ['key' => 'minaPiedra', 'level' => 1, 'x' => 1464, 'y' => 488, 'shape' => 'diamond', 'width' => 368, 'height' => 184],
                ['key' => 'minaHierro', 'level' => 2, 'x' => 616, 'y' => 576, 'shape' => 'diamond', 'width' => 288, 'height' => 176],
                ['key' => 'cuartel', 'level' => 1, 'x' => 1160, 'y' => 640, 'shape' => 'diamond', 'width' => 336, 'height' => 208],
                ['key' => 'laboratorio', 'level' => 0, 'x' => 1480, 'y' => 776, 'shape' => 'diamond', 'width' => 336, 'height' => 200],
                ['key' => 'muralla', 'level' => 2, 'x' => 432, 'y' => 536, 'shape' => 'rect', 'width' => 640, 'height' => 120],
                ['key' => 'foso', 'level' => 1, 'x' => 780, 'y' => 860, 'shape' => 'rect', 'width' => 680, 'height' => 120],
            ],
        };
    }

    /**
     * @return array{key: string, level: int, x: int, y: int, shape: string, width: int, height: int}|null
     */
    public static function plotForKey(string $key, string $map = 'bosque'): ?array
    {
        foreach (self::plots($map) as $plot) {
            if ($plot['key'] === $key) {
                return $plot;
            }
        }

        return null;
    }
}
