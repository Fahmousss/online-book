import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Pagination from "@/Components/Pagination";
import ProfileDropdown from "@/Components/ProfileDropdown";
import Dropdown from "@/Components/Dropdown";

interface Author {
    id: number;
    name: string;
    // ... any other author fields
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
    image: string;
    published_date: string;
}

export default function Welcome({
    auth,
    isAdmin,
    books: initialBooks,
}: PageProps<{ books: PaginationData; isAdmin: boolean }>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [books, setBooks] = useState(initialBooks);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

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

        channel.listen("BookCreated", (e: { book: Book }) => {
            setBooks((currentBooks) => ({
                ...currentBooks,
                data: [...currentBooks.data, e.book],
            }));
        });

        channel.listen("BookUpdated", (e: { book: Book }) => {
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

    // Filter books based on search query
    const filteredBooks = books.data.filter(
        (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    }, [searchQuery]);

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                <div className="relative flex min-h-screen flex-col  selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full px-6 ">
                        <header className="items-center py-10 ">
                            <nav className="flex justify-end flex-1 -mx-3">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={route("dashboard")}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Dashboard
                                        </Link>
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center capitalize rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                                    >
                                                        {auth.user.name}

                                                        <svg
                                                            className="-me-0.5 ms-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                <Dropdown.Link
                                                    href={route("profile.edit")}
                                                >
                                                    Profile
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route("logout")}
                                                    method="post"
                                                    as="button"
                                                >
                                                    Log Out
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                                {isAdmin && (
                                    <a
                                        href="/admin"
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Admin
                                    </a>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6">
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search books or authors..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF2D20] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                {paginatedBooks.map((book) => (
                                    <div
                                        key={book.slug}
                                        className="overflow-hidden transition-all bg-white rounded-lg shadow-md hover:shadow-lg dark:bg-gray-800"
                                    >
                                        <div className="p-6">
                                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                                {book.title}
                                            </h3>
                                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                                {book.author?.name}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${book.price}
                                                </span>
                                                <Link
                                                    href={"/"}
                                                    className="rounded-md bg-[#FF2D20] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#FF2D20]/80"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                lastPage={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
