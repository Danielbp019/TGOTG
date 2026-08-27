<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
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
            'recipient_nick' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
        ];
    }
}
