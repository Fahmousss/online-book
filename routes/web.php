<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'isAdmin' => Auth::check() && Auth::user()->roles->pluck('name')->contains('admin'),
        'books' => [
            'data' => Book::withTrashed()->with(['author:id,name', 'categories:id,name'])->orderBy('created_at', 'desc')->get(),
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 14,
            'total' => Book::count(),
        ],
        'categories' => Category::all()->pluck('name'),
    ]);
})->name('home');

Route::get('/books/{slug}', [BookController::class, 'show'])->name('books.show');

Route::get('/dashboard', [OrderController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/books/{slug}', [OrderController::class, 'store'])->name('books.addToCart');
    Route::get('/orders/{orderId}', [OrderController::class, 'checkout'])->name('orders.checkout');
    Route::patch('/orders/{orderId}/pay', [OrderController::class, 'pay'])->name('orders.pay');
    Route::patch('/orders/{orderId}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::delete('/orders/{orderId}', [OrderController::class, 'destroy'])->name('orders.removeOrder');
    Route::delete('/orders/{orderId}/{orderItemId}', [OrderController::class, 'removeItem'])->name('orders.removeItem');
    Route::patch('/orders/{orderId}/{orderItemId}', [OrderController::class, 'updateQuantity'])->name('orders.updateQuantity');
});

require __DIR__ . '/auth.php';
