<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Book extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'author_id',
        'stock',
        'price',
        'published_date',
        'images',
        'is_featured',
    ];

    protected $dates = ['deleted_at', 'published_date'];

    protected $casts = [
        'published_date' => 'datetime',
        'is_featured' => 'boolean',
    ];

    protected static function booted()
    {
        static::deleted(function ($book) {
            if ($book->isForceDeleting()) {
                Storage::disk('public')->delete($book->images);
            }
        });
    }
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
