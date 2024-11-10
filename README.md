# Bookstore Project

A Laravel-based online bookstore application with real-time updates using Laravel Echo and Pusher.

## Prerequisites

-   PHP >= 8.1
-   Composer
-   Node.js & NPM
-   MySQL
-   Pusher account for real-time features

## Installation Steps

1. Clone the repository

bash
git clone <repository-url>
cd bookstore-project

2. Install dependencies

bash
composer install
npm install

3. Configure environment variables

Copy the .env.example file to .env and set the necessary variables.

4. Generate an application key

php artisan key:generate

5. Run migrations and seed the database

php artisan migrate --seed

6. Start the Laravel development server

php artisan serve

7. Start the React development server

npm run dev
