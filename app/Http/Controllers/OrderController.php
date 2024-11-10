<?php

namespace App\Http\Controllers;

use App\Events\BookUpdated;
use App\Models\Orders;
use App\Models\Book;
use App\Models\OrderItems;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Orders::where('user_id', Auth::id())
            ->with('orderItems.book.author')
            ->get();

        return Inertia::render('Dashboard', ['orders' => $orders]);
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

            // Find or create pending order for the user
            $order = Orders::firstOrCreate(
                [
                    'user_id' => $request->user_id,
                    'status' => 'cart'
                ],
                [
                    'total_price' => 0
                ]
            );

            // Check if this book already exists in order items
            $existingItem = $order->orderItems()->where('book_id', $book->id)->first();

            if ($existingItem) {
                // Update existing order item
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $request->quantity,
                    'price' => $book->price
                ]);
            } else {
                // Create new order item
                $order->orderItems()->create([
                    'book_id' => $book->id,
                    'quantity' => $request->quantity,
                    'price' => $book->price,
                ]);
            }

            // Update total price
            $order->update([
                'total_price' => $order->orderItems->sum(function ($item) {
                    return $item->price * $item->quantity;
                })
            ]);

            return Redirect::back()->with('success', 'Book added to cart successfully!');
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id) {}

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
        $order = Orders::findOrFail($id);
        Gate::authorize('delete', $order);
        $order->delete();

        return Redirect::back()->with('success', 'Item removed from cart successfully!');
    }

    public function removeItem(string $orderId, string $orderItemId)
    {
        $orderItem = OrderItems::findOrFail($orderItemId);
        $order = Orders::findOrFail($orderId);
        Gate::authorize('delete', $order);
        $orderItem->forceDelete();

        if ($order->orderItems->count() === 0) {
            $order->forceDelete();
        }
        $order->update([
            'total_price' => $order->orderItems->sum(function ($item) {
                return $item->price * $item->quantity;
            })
        ]);

        return Redirect::back()->with('success', 'Item removed from cart successfully!');
    }

    public function updateQuantity(Request $request, string $orderId, string $orderItemId)
    {
        $orderItem = OrderItems::findOrFail($orderItemId);
        $order = Orders::findOrFail($orderId);
        Gate::authorize('update', $order);
        $orderItem->update([
            'quantity' => $request->quantity,
        ]);
        $order->update([
            'total_price' => $order->orderItems->sum(function ($item) {
                return $item->price * $item->quantity;
            })
        ]);
    }

    public function checkout($orderId)
    {
        return DB::transaction(function () use ($orderId) {
            $order = Orders::where('user_id', Auth::id())
                ->where('id', $orderId)
                ->where('status', 'cart')
                ->with('orderItems.book.author')
                ->firstOrFail();

            // Check stock availability for all items
            foreach ($order->orderItems as $item) {
                $book = $item->book;
                if ($book->stock < $item->quantity) {
                    return back()->withErrors(['error' => "Not enough stock available for {$book->title}"]);
                }
            }

            // Decrement stock for all items
            // foreach ($order->orderItems as $item) {
            //     $item->book->decrement('stock', $item->quantity);

            //     // Trigger BookUpdated event for each book
            //     event(new BookUpdated($item->book));
            // }

            // $order->update([
            //     'status' => 'pending',
            // ]);

            return Inertia::render('Orders/Checkout', ['order' => $order]);

            // return Redirect::route('dashboard')
            //     ->with('success', 'Order completed successfully!');
        });
    }

    public function cancel(string $orderId)
    {
        return DB::transaction(function () use ($orderId) {
            $order = Orders::with('orderItems.book')->findOrFail($orderId);
            Gate::authorize('update', $order);


            // Return stock for all items
            foreach ($order->orderItems as $item) {
                $item->book->increment('stock', $item->quantity);
                event(new BookUpdated($item->book));
            }

            $order->update([
                'status' => 'cancelled',
            ]);
            event(new BookUpdated($order->orderItems->first()->book));

            return Redirect::back()->with('success', 'Order cancelled successfully!');
        });
    }

    public function pay(Request $request, string $orderId)
    {
        return DB::transaction(function () use ($request, $orderId) {
            // Validate the request
            $request->validate([
                'address' => 'nullable|string',
            ]);

            $order = Orders::where('user_id', Auth::id())
                ->where('id', $orderId)
                ->where('status', 'cart')
                ->with('orderItems.book')
                ->firstOrFail();

            // Check stock availability for all items
            foreach ($order->orderItems as $item) {
                $book = $item->book;
                if ($book->stock < $item->quantity) {
                    return back()->withErrors(['error' => "Not enough stock available for {$book->title}"]);
                }
            }

            // Calculate admin tax (10%)
            $adminTax = $order->total_price * 0.10;
            $finalTotal = $order->total_price + $adminTax;

            // Update order with address and final total
            $order->update([
                'status' => 'pending',
                'address' => $request->address ? $request->address : Auth::user()->address,
                'total_price' => $finalTotal,
            ]);


            // Decrement stock for all items
            foreach ($order->orderItems as $item) {
                $item->book->decrement('stock', $item->quantity);
            }
            event(new BookUpdated($item->book));

            return Redirect::route('dashboard')
                ->with('success', 'Order completed successfully!');
        });
    }
}
