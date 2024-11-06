<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Book extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'author_id',
        'category_id',
        'stock',
        'price',
        'published_date',
        'images',
        'is_featured',
    ];

    protected $dates = ['deleted_at', 'published_date'];

    // Relationship with Author
    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    // Relationship with Category
    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    // Relationship with OrderItems
    public function orderItems()
    {
        return $this->hasMany(OrderItems::class);
    }
}
