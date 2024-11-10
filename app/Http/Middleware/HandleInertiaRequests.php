<?php

namespace App\Http\Middleware;

use App\Models\Book;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'admin' => $request->user()?->hasRole('admin'),
                'cart_count' => $request->user()
                    ? $request->user()
                    ->orders()
                    ->where('status', 'cart')
                    ->withCount('orderItems')
                    ->first()?->order_items_count ?? null
                    : null,
            ],
            'ziggy' => fn() => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'recommendedBooks' => Book::withTrashed()
                ->with('author')
                ->inRandomOrder()
                ->limit(6)
                ->get(),
        ];
    }
}
