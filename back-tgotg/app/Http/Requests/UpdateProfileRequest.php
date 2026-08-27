<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
        $user = $this->user();

        return [
            'nick' => [
                'sometimes',
                'string',
                'min:3',
                'max:24',
                Rule::unique('users', 'nick')->ignore($user->id),
            ],
            'current_password' => ['required_with:password', 'string'],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nick.unique' => __('Este nick ya está en uso.'),
        ];
    }
}
