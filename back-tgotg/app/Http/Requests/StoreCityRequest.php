<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:30'],
            'region_id' => ['required', 'uuid', 'exists:regions,id'],
            'biome_id' => ['required', 'uuid', 'exists:biomes,id'],
        ];
    }
}
