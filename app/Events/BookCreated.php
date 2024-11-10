<?php

namespace App\Events;

use App\Models\Book;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Book $book) {}

    public function broadcastOn(): array
    {
        return [new Channel('books')];
    }

    public function broadcastAs(): string
    {
        return 'book.created';
    }

    public function broadcastWith(): array
    {
        return [
            'book' => $this->book->load('author', 'categories')
        ];
    }
}
