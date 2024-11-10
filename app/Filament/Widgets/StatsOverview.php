<?php

namespace App\Filament\Widgets;

use App\Models\Book;
use App\Models\User;
use App\Models\Orders;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        return [
            Stat::make('Total Books', Book::count())
                ->description('Total number of books in the system')
                ->chart(Book::query()
                    ->latest()
                    ->take(7)
                    ->pluck('id')
                    ->toArray())
                ->color($this->getColorBasedOnTrend(Book::class))
                ->icon('heroicon-o-book-open'),

            Stat::make('Total Users', User::count())
                ->description('Registered users')
                ->chart(User::query()
                    ->latest()
                    ->take(7)
                    ->pluck('id')
                    ->toArray())
                ->color($this->getColorBasedOnTrend(User::class))
                ->icon('heroicon-o-users'),

            Stat::make('Total Orders', Orders::count())
                ->description('All orders')
                ->chart(Orders::query()
                    ->latest()
                    ->take(7)
                    ->pluck('id')
                    ->toArray())
                ->color($this->getColorBasedOnTrend(Orders::class))
                ->icon('heroicon-o-shopping-cart'),

            Stat::make('Pending Orders', Orders::where('status', 'pending')->count())
                ->description('Orders awaiting processing')
                ->chart(Orders::query()
                    ->where('status', 'pending')
                    ->latest()
                    ->take(7)
                    ->pluck('id')
                    ->toArray())
                ->color($this->getColorBasedOnCount(Orders::where('status', 'pending')))
                ->icon('heroicon-o-clock'),

            Stat::make('Shipped Orders', Orders::where('status', 'shipped')->count())
                ->description('Successfully shipped orders')
                ->chart(Orders::query()
                    ->where('status', 'shipped')
                    ->latest()
                    ->take(7)
                    ->pluck('id')
                    ->toArray())
                ->color($this->getColorBasedOnCount(Orders::where('status', 'shipped')))
                ->icon('heroicon-o-truck'),
        ];
    }

    protected function getColorBasedOnTrend($modelClass): string
    {
        $today = $modelClass::whereDate('created_at', today())->count();
        $yesterday = $modelClass::whereDate('created_at', today()->subDay())->count();

        if ($today > $yesterday) {
            return 'success';
        } elseif ($today < $yesterday) {
            return 'danger';
        }
        return 'warning';
    }

    protected function getColorBasedOnCount($query): string
    {
        $count = $query->count();

        if ($count > 10) {
            return 'success';
        } elseif ($count > 5) {
            return 'warning';
        }
        return 'danger';
    }
}
