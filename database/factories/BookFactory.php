<?php

namespace Database\Factories;

use App\Models\Author;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraph(10, true),
            'author_id' => Author::get()->random()->id,
            'stock' => fake()->numberBetween(0, 100),
            'price' => fake()->randomFloat(2, 9.99, 99.99),
            'published_date' => fake()->dateTimeBetween('-5 years', 'now'),
            'images' => null,
            'is_featured' => fake()->boolean(20), // 20% chance of being featured
        ];
    }

    /**
     * Configure the model factory.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterCreating(function ($book) {
            // Attach 1-3 random categories to each book
            $categories = Category::all();
            $book->categories()->attach($categories->random(rand(1, 3)));
        });
    }

    /**
     * Indicate that the book is featured.
     */
    public function featured()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_featured' => true,
            ];
        });
    }

    /**
     * Indicate that the book is out of stock.
     */
    public function outOfStock()
    {
        return $this->state(function (array $attributes) {
            return [
                'stock' => 0,
            ];
        });
    }
}
