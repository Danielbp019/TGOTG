<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateWorldRequest extends FormRequest
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
            'duration_key' => ['required', 'string', 'exists:game_options,key'],
            'multiplier_key' => ['required', 'string', 'exists:game_options,key'],
        ];
    }
}
