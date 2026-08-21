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
     * X: restar mueve izquierda, sumar mueve derecha y Y: restar mueve arriba y sumar mueve abajo.
     * 
     * @param  string  $map  Clave de mapa (bosque por defecto). Futuros: desierto, montaña...
     * @return list<array{key: string, level: int, x: int, y: int, shape: string, width: int, height: int}>
     */
    public static function plots(string $map = 'bosque'): array
    {
        return match ($map) {
            default => [
                ['key' => 'ayuntamiento', 'level' => 3, 'x' => 970, 'y' => 290, 'shape' => 'diamond', 'width' => 340, 'height' => 340],
                ['key' => 'granja', 'level' => 2, 'x' => 1393, 'y' => 283, 'shape' => 'diamond', 'width' => 340, 'height' => 340],
                ['key' => 'aserradero', 'level' => 2, 'x' => 1190, 'y' => 430, 'shape' => 'diamond', 'width' => 340, 'height' => 340],
                ['key' => 'minaPiedra', 'level' => 1, 'x' => 1650, 'y' => 430, 'shape' => 'diamond', 'width' => 340, 'height' => 340],
                ['key' => 'minaHierro', 'level' => 2, 'x' => 985, 'y' => 576, 'shape' => 'diamond', 'width' => 340, 'height' => 340],
                ['key' => 'cuartel', 'level' => 1, 'x' => 1430, 'y' => 570, 'shape' => 'diamond', 'width' => 340, 'height' => 340],
                ['key' => 'laboratorio', 'level' => 1, 'x' => 1670, 'y' => 710, 'shape' => 'diamond', 'width' => 340, 'height' => 340],
                ['key' => 'muralla', 'level' => 2, 'x' => 432, 'y' => 536, 'shape' => 'rect', 'width' => 680, 'height' => 120],
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
