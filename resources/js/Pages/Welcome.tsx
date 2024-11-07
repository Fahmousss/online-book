import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";

interface Author {
    id: number;
    name: string;
    // ... any other author fields
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
    books: initialBooks,
}: PageProps<{ books: Book[] }>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [books, setBooks] = useState(initialBooks);

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
            console.log("Received new book:", e.book);
            setBooks((currentBooks) => [...currentBooks, e.book]);
        });

        channel.listen("BookUpdated", (e: { book: Book }) => {
            console.log("Received updated book:", e.book);
            setBooks((currentBooks) =>
                currentBooks.map((book) =>
                    book.id === e.book.id ? e.book : book
                )
            );
        });

        return () => {
            console.log("Cleaning up Echo listener");
            window.Echo.leave("books");
        };
    }, []);

    const filteredBooks = books?.filter(
        (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                <div className="relative flex min-h-screen flex-col  selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full px-6 ">
                        <header className="items-center py-10 ">
                            <nav className="flex justify-end flex-1 -mx-3">
                                {auth.user ? (
                                    <Link
                                        href={route("dashboard")}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Dashboard
                                    </Link>
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
                                {filteredBooks?.map((book) => (
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
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
