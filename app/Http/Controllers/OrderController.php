<?php

namespace App\Http\Controllers;

use App\Models\Orders;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            "user_id" => "required|exists:users,id",
            "book_id" => "required|exists:books,id",
            "quantity" => "required|integer|min:1",
        ]);

        return DB::transaction(function () use ($request) {
            $book = Book::lockForUpdate()->findOrFail($request->book_id);

            if ($book->stock < $request->quantity) {
                return back()->withErrors(['quantity' => 'Not enough stock available.']);
            }

            // Create the order
            $order = Orders::create([
                'user_id' => $request->user_id,
                'order_date' => now(),
                'total_price' => $book->price * $request->quantity,
            ]);

            $order->orderItems()->create([
                'book_id' => $book->id,
                'quantity' => $request->quantity,
                'price' => $book->price,
            ]);

            $book->decrement('stock', $request->quantity);

            return redirect()->back()->with('success', 'Order placed successfully!');
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
