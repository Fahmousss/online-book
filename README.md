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

```bash
git clone <repository-url>
cd bookstore-project
```

2. Install dependencies and Build Assets

```bash
composer install
npm install
npm run build
```

3. Configure environment variables

```bash
cp .env.example .env
```

4. Generate an application key

```bash
php artisan key:generate
```

5. Run migrations and seed the database

```bash
php artisan migrate --seed
```

6. Start the Laravel development server

```bash
php artisan serve
```

7. Start the React development server

```bash
npm run dev
```

8. Start Reverb and Queue Worker

```bash
php artisan reverb:start --debug
php artisan queue:work
```
