# Online Book Store Project

This project is a homework assignment for Rakamin Academy, implementing an online bookstore web application. The system allows users to browse and purchase books while providing administrators with tools to manage inventory and orders.

Key Features:

-   User authentication and authorization
-   Book catalog with search and filtering capabilities
-   Shopping cart functionality
-   Real-time stock updates using Laravel WebSockets
-   Order management system
-   Admin dashboard for inventory control
-   Responsive design using Tailwind CSS
-   Built with Laravel 11 and React + TypeScript

The application demonstrates full-stack development skills including:

-   Backend development with Laravel
-   Frontend development with React and TypeScript
-   Real-time updates with WebSockets
-   Database design and management
-   Authentication and authorization
-   RESTful API development
-   UI/UX implementation

## Prerequisites

-   PHP >= 8.1
-   Composer
-   Node.js & NPM
-   MySQL

## Installation Steps

1. Clone the repository

```bash
git clone https://github.com/Fahmousss/online-book.git
cd online-book
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
