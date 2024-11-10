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
        Category::create(['name' => 'Fiction', 'description' => 'Fictional stories and novels']);
        Category::create(['name' => 'Non-Fiction', 'description' => 'Educational and factual books']);
        Category::create(['name' => 'Science Fiction', 'description' => 'Books about futuristic and scientific concepts']);
        Category::create(['name' => 'Mystery', 'description' => 'Detective stories and thrillers']);
        Category::create(['name' => 'Romance', 'description' => 'Love stories and romantic novels']);
        Author::factory(10)->create();
        Book::factory(50)->create();
        Book::factory(5)->outOfStock()->create();

        $user = User::factory()->create([
            'name' => 'Admin Kito',
            'email' => 'admin@admin.online.book.id',
            'address' => 'Jl. Admin',
        ]);
        $role = Role::create([
            'name' => 'admin'
        ]);
        $user->assignRole($role);
    }
}
