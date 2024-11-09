import { Head, Link, router } from "@inertiajs/react";
import { PageProps } from "@/types";

interface Book {
    id: number;
    title: string;
    author: {
        name: string;
    };
    price: number;
    images: string;
    description: string;
    categories: {
        name: string;
    }[];
}

export default function Show({ auth, book }: PageProps<{ book: Book }>) {
    console.log(book.images);

    return (
        <>
            <Head title={book.title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div>
                                    <img
                                        src={
                                            book.images
                                                ? `/storage/${book.images}`
                                                : `https://via.placeholder.com/400x600/000000/FFFFFF/?text=${book.title}`
                                        }
                                        loading="lazy"
                                        alt={book.title}
                                        className="object-cover w-full h-full rounded-lg"
                                    />
                                </div>
                                <div>
                                    <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {book.title}
                                    </h1>
                                    <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
                                        by {book.author.name}
                                    </p>
                                    <div className="mb-4">
                                        {book.categories?.map((category) => (
                                            <span
                                                key={category.name}
                                                className="inline-block px-3 py-1 mr-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                                        ${book.price}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {book.description ||
                                            "No description available"}
                                    </p>
                                    <Link
                                        as="button"
                                        href={
                                            auth.user
                                                ? `/cart/add/${book.id}`
                                                : "/login"
                                        }
                                        className="mt-8 rounded-md bg-[#FF2D20] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#FF2D20]/80"
                                    >
                                        Add to Cart
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
