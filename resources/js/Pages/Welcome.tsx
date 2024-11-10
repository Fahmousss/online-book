import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Pagination from "@/Components/Pagination";
import ProfileDropdown from "@/Components/ProfileDropdown";
import Dropdown from "@/Components/Dropdown";
import MainLayout from "@/Layouts/MainLayout";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface Author {
    id: number;
    name: string;
    // ... any other author fields
}

interface Category {
    id: number;
    name: string;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Book[];
}

interface Book {
    id: number;
    title: string;
    slug: string;
    description: string;
    author?: Author; // Make author optional since it's a relationship
    price: number;
    stock: number;
    images?: string;
    published_date: string;
    categories?: Category[];
    deleted_at: string | null;
}

export default function Welcome({
    auth,
    books: initialBooks,
    categories,
}: PageProps<{
    books: PaginationData;
    categories: string[];
}>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [books, setBooks] = useState(initialBooks);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 14;
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    useEffect(() => {
        console.log("Setting up Echo listener");

        // Verify Echo is available
        if (typeof window.Echo === "undefined") {
            console.error("Echo is not initialized");
            return;
        }

        const channel = window.Echo.channel("books");

        // Add connection status logging
        channel
            .subscribed(() => {
                console.log("Successfully subscribed to books channel");
            })
            .error((error: any) => {
                console.error("Echo connection error:", error);
            });

        channel.listen(".book.created", (e: { book: Book }) => {
            console.log("BookCreated event received");

            setBooks((currentBooks) => ({
                ...currentBooks,
                data: [...currentBooks.data, e.book],
            }));
        });

        channel.listen(".book.updated", (e: { book: Book }) => {
            console.log("BookUpdated event received");
            setBooks((currentBooks) => ({
                ...currentBooks,
                data: currentBooks.data.map((book) =>
                    book.id === e.book.id ? e.book : book
                ),
            }));
        });

        return () => {
            console.log("Cleaning up Echo listener");
            window.Echo.leave("books");
        };
    }, []);

    // Filter books based on search query and selected categories
    const filteredBooks = books.data.filter(
        (book) =>
            (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author?.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) &&
            (selectedCategories.length === 0 ||
                book.categories?.some((category) =>
                    selectedCategories.includes(category.name)
                ))
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Optionally scroll to top when page changes
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategories]);

    return (
        <MainLayout auth={auth}>
            <Head title="Welcome" />
            <main className="mt-6">
                <div className="mb-8 text-center">
                    <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">
                        Welcome to Our Bookstore
                    </h1>
                    <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
                        Discover your next favorite book from our extensive
                        collection
                    </p>
                </div>
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search books or authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF2D20] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="mb-6">
                    <p className="mb-2 text-sm font-medium text-gray-500">
                        Filter by category:
                    </p>
                    {categories.map((category) => (
                        <div key={category} className="inline-block mr-2">
                            <input
                                id={category}
                                type="checkbox"
                                value={category}
                                checked={selectedCategories.includes(category)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedCategories((prev) =>
                                        prev.includes(value)
                                            ? prev.filter((c) => c !== value)
                                            : [...prev, value]
                                    );
                                }}
                                className="hidden"
                            />
                            <label
                                key={category}
                                className={`px-2 py-1 rounded-md text-sm inline-flex items-center text-white font-medium capitalize hover:bg-[#FF2D20]/80 select-none transition-colors cursor-pointer  ring-1 ring-transparent focus-visible:ring-[#FF2D20] ring-offset-1 ${
                                    selectedCategories.includes(category)
                                        ? "bg-[#FF2D20]/80 text-white ring-white"
                                        : ""
                                }`}
                                htmlFor={category}
                            >
                                {category}
                            </label>
                        </div>
                    ))}
                </div>

                {paginatedBooks.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-7">
                            {paginatedBooks.map((book) => (
                                <Link
                                    key={book.slug}
                                    href={`/books/${book.slug}`}
                                    className={`overflow-hidden transition-all bg-white rounded-lg shadow-md hover:shadow-inner hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 ${
                                        book.deleted_at ? "opacity-60" : ""
                                    }`}
                                >
                                    <div className="p-5">
                                        <img
                                            src={
                                                book.images
                                                    ? `/storage/${book.images}`
                                                    : `/storage/logo.png`
                                            }
                                            alt={book.title}
                                            loading="lazy"
                                            width={400}
                                            height={600}
                                            className="object-cover w-full h-full mb-4 rounded-lg"
                                        />
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {book.author?.name}
                                        </p>
                                        <h3 className="mb-2 text-sm font-light text-gray-900 dark:text-white">
                                            {book.title}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900 text-md dark:text-white">
                                                ${book.price}
                                            </span>
                                        </div>
                                        {(book.stock === 0 ||
                                            book.deleted_at) && (
                                            <p className="text-xs text-red-500">
                                                {book.deleted_at
                                                    ? "Not Available"
                                                    : "Out of stock"}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            lastPage={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <ExclamationCircleIcon className="w-56 h-56 text-gray-600 dark:text-gray-400" />
                            <p className="text-2xl text-gray-600 dark:text-gray-400">
                                No books found
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </MainLayout>
    );
}
