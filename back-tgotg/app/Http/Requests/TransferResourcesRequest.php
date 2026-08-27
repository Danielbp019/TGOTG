<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TransferResourcesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient_player_id' => ['required', 'uuid', 'exists:players,id'],
            'gold' => ['nullable', 'integer', 'min:0'],
            'wood' => ['nullable', 'integer', 'min:0'],
            'stone' => ['nullable', 'integer', 'min:0'],
            'iron' => ['nullable', 'integer', 'min:0'],
            'food' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'recipient_player_id.required' => 'Debes seleccionar un destinatario.',
            'recipient_player_id.exists' => 'El destinatario no existe.',
            'gold.min' => 'La cantidad de oro no puede ser negativa.',
            'wood.min' => 'La cantidad de madera no puede ser negativa.',
            'stone.min' => 'La cantidad de piedra no puede ser negativa.',
            'iron.min' => 'La cantidad de hierro no puede ser negativa.',
            'food.min' => 'La cantidad de comida no puede ser negativa.',
        ];
    }
}
