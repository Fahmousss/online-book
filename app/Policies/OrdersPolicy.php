<?php

namespace App\Policies;

use App\Models\Orders;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrdersPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Orders $orders): bool
    {
        return $user->id === $orders->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return false;
        }
        // Check if user has reached order limit
        $pendingOrdersCount = Orders::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        // Limit users to 5 pending orders at a time
        return $pendingOrdersCount < 5;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Orders $orders): bool
    {
        // Check if order belongs to user
        if ($user->id !== $orders->user_id) {
            return false;
        }

        // Check if order is still pending
        if ($orders->status !== 'pending') {
            return false;
        }

        // Check if order is less than 1 hour old
        return $orders->created_at->diffInHours(now()) < 1;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Orders $orders): bool
    {
        // Check if order belongs to user
        if ($user->id !== $orders->user_id) {
            return false;
        }

        // Check if order is still pending
        if ($orders->status !== 'pending') {
            return false;
        }

        // Check if order is less than 1 hour old
        return $orders->created_at->diffInHours(now()) < 1;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Orders $orders): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Orders $orders): bool
    {
        return true;
    }
}
