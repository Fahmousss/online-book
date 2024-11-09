<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItems extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'orders_id',
        'book_id',
        'quantity',
        'price',
    ];

    protected $dates = ['deleted_at'];

    // Relationship with Order
    public function order()
    {
        return $this->belongsTo(Orders::class);
    }

    // Relationship with Book
    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
