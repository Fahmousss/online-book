<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create 50 regular books
        Category::factory(5)->create();
        Author::factory(10)->create();
        Book::factory(50)->create();

        $user = User::factory()->create([
            'name' => 'Admin Kito',
            'email' => 'admin@admin.online.book.id',
            'address' => 'Jl. Admin',
        ]);
        $role = Role::create([
            'name' => 'admin'
        ]);
        $user->assignRole($role);

        Book::factory(10)->featured()->create();
        // Create 5 out-of-stock books
        Book::factory(5)->outOfStock()->create();
    }
}
