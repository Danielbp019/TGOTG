<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UnitTypesRequest extends FormRequest
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
            'civilization' => ['nullable', 'string', 'exists:civilizations,key'],
        ];
    }
}
