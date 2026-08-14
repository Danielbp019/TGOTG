<?php

test('the api returns a successful response', function () {
    $response = $this->getJson('/api/ping');

    $response->assertOk()->assertJson(['message' => 'pong']);
});
