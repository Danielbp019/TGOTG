<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreClanRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:50', 'unique:clans,name'],
            'acronym' => [
                'required',
                'string',
                'min:'.config('game_balance.clan.acronym_min_length', 3),
                'max:'.config('game_balance.clan.acronym_max_length', 5),
                'unique:clans,acronym',
                'alpha',
            ],
        ];
    }
}
