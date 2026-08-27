<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RepairBuildingRequest extends FormRequest
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
            'type' => ['required', 'string', 'in:paid,auto'],
        ];
    }
}
