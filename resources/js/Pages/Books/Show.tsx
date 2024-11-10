import { Head, Link, router, useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import MainLayout from "@/Layouts/MainLayout";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import {
    FormEvent,
    FormEventHandler,
    useState,
    useMemo,
    useEffect,
} from "react";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import { Transition } from "@headlessui/react";

interface Book {
    id: number;
    slug: string;
    title: string;
    author: {
        name: string;
    };
    stock: number;
    price: number;
    images: string;
    description: string;
    categories: {
        name: string;
    }[];
    deleted_at: string | null;
}

export default function Show({
    auth,
    book,
    recommendedBooks,
}: PageProps<{ book: Book; recommendedBooks: Book[] }>) {
    const [quantity] = useState(1);
    const [books, setBooks] = useState<Book[]>([book]);
    const {
        data,
        setData,
        post,
        clearErrors,
        errors,
        setError,
        processing,
        recentlySuccessful,
    } = useForm({
        quantity,
        user_id: auth.user?.id,
        book_id: book.id,
        price: book.price,
    });

    const addToCart: FormEventHandler = (e) => {
        e.preventDefault();
        if (data.quantity > book.stock) {
            setError("quantity", "Quantity is greater than the stock");
            return;
        }
        if (data.quantity < 1) {
            setError("quantity", "Quantity must be greater than 0");
            return;
        }
        clearErrors();
        post(route("books.addToCart", { slug: book.slug }));
    };

    const randomizedRecommendedBooks = useMemo(() => {
        return recommendedBooks
            .filter((b) => b.id !== book.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
    }, [recommendedBooks, book.id]);

    useEffect(() => {
        const channel = window.Echo.channel("books");

        // Add connection status logging
        channel
            .subscribed(() => {
                console.log("Successfully subscribed to books channel");
            })
            .error((error: any) => {
                console.error("Echo connection error:", error);
            });

        channel.listen(".book.updated", (e: { book: Book }) => {
            console.log(e);
            setBooks((currentBooks) =>
                currentBooks.map((books) =>
                    books.id === e.book.id ? e.book : books
                )
            );
        });
        return () => {
            console.log("Cleaning up Echo listener");
            window.Echo.leave("books");
        };
    }, []);

    return (
        <MainLayout auth={auth}>
            <Head title={books[0].title} />

            <div className="max-w-6xl p-6 mx-auto">
                <div className="flex flex-col gap-14 sm:flex-row">
                    <div>
                        <img
                            src={
                                books[0].images
                                    ? `/storage/${books[0].images}`
                                    : `/storage/logo.png`
                            }
                            loading="lazy"
                            alt={books[0].title}
                            width={1500}
                            className="object-cover rounded-lg "
                        />
                    </div>
                    <div>
                        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                            {books[0].title}
                        </h1>
                        <p className="mb-4 text-gray-600 text-md dark:text-gray-400">
                            by {books[0].author.name}
                        </p>

                        <p className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                            ${books[0].price}
                        </p>

                        <div
                            className={`mb-6 text-sm ${
                                books[0].stock > 0
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            Stock : {books[0].stock}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {books[0].categories?.map((category) => (
                                <span
                                    key={category.name}
                                    className="inline-block px-3 py-1 mr-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300"
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            {books[0].description || "No description available"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="fixed z-10 w-full -translate-x-1/2 left-1/2 max-w-7xl bottom-7">
                <div
                    key={books[0].slug}
                    className="overflow-hidden transition-all bg-white rounded-lg shadow-md dark:bg-gray-800"
                >
                    <div className="flex flex-col items-start justify-between p-5 sm:items-center sm:flex-row">
                        <div className="flex flex-row items-start gap-4">
                            <img
                                src={
                                    books[0].images
                                        ? `/storage/${books[0].images}`
                                        : `/storage/logo.png`
                                }
                                alt={books[0].title}
                                loading="lazy"
                                className="object-cover w-24 rounded-lg sm:w-20"
                            />
                            <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {books[0].categories?.map((category) => (
                                        <span
                                            key={category.name}
                                            className="inline-block px-3 py-1 mr-2 text-xs font-semibold text-gray-700 bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 sm:text-md dark:text-gray-400">
                                    {books[0].author?.name}
                                </p>
                                <h3 className="mb-2 text-lg font-light text-gray-900 sm:text-xl dark:text-white">
                                    {books[0].title}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-900 text-md dark:text-white">
                                        ${books[0].price}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {books[0].deleted_at === null && books[0].stock > 0 ? (
                            <form onSubmit={addToCart}>
                                <div className="flex flex-row-reverse items-center gap-5 sm:flex-row">
                                    <div className="">
                                        <TextInput
                                            id="quantity"
                                            type="number"
                                            className="w-16 mt-4 sm:mt-0"
                                            value={data.quantity}
                                            // min={1}
                                            // max={book.stock}
                                            onChange={(e) => {
                                                setData(
                                                    "quantity",
                                                    parseInt(e.target.value)
                                                );
                                                clearErrors();
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <button
                                            disabled={processing}
                                            className="h-full rounded-md bg-[#FF2D20] sm:px-6 px-3 py-3 sm:py-3 sm:mr-6 mt-4 sm:mt-0 font-medium text-white text-xs sm:text-xl transition-colors hover:bg-[#FF2D20]/80 flex items-center gap-2"
                                        >
                                            <ShoppingCartIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                                            Add to Cart
                                        </button>
                                        <InputError
                                            message={errors.quantity}
                                            className="absolute text-nowrap"
                                        />
                                    </div>
                                </div>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Added to cart
                                    </p>
                                </Transition>
                            </form>
                        ) : (
                            <button
                                disabled
                                className="h-full rounded-md bg-[#FF2D20] px-6 py-3 mr-6 font-medium text-white text-xs sm:text-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCartIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                                {books[0].deleted_at
                                    ? "Not Available"
                                    : "Out of stock"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-12 mb-8">
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    You might also like
                </h2>
                <div className="relative">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
                        {randomizedRecommendedBooks.map((recommendedBook) => (
                            <Link
                                key={recommendedBook.slug}
                                href={`/books/${recommendedBook.slug}`}
                                className={`overflow-hidden transition-all bg-white rounded-lg shadow-md hover:shadow-inner hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 ${
                                    recommendedBook.deleted_at
                                        ? "opacity-60"
                                        : ""
                                }`}
                            >
                                <div className="p-5">
                                    <img
                                        src={
                                            recommendedBook.images
                                                ? `/storage/${recommendedBook.images}`
                                                : `/storage/logo.png`
                                        }
                                        alt={recommendedBook.title}
                                        loading="lazy"
                                        width={400}
                                        height={600}
                                        className="object-cover w-full h-full mb-4 rounded-lg"
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {recommendedBook.author.name}
                                    </p>
                                    <h3 className="mb-2 text-sm font-light text-gray-900 dark:text-white">
                                        {recommendedBook.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 text-md dark:text-white">
                                            ${recommendedBook.price}
                                        </span>
                                    </div>
                                    {(recommendedBook.stock === 0 ||
                                        recommendedBook.deleted_at) && (
                                        <p className="text-xs text-red-500">
                                            {recommendedBook.deleted_at
                                                ? "Not Available"
                                                : "Out of stock"}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
