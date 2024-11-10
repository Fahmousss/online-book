import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import MainLayout from "@/Layouts/MainLayout";
import {
    Button,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
} from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Head, router, useForm } from "@inertiajs/react";
import { count } from "console";
import { useState, useEffect } from "react";
import Echo from "laravel-echo";

interface OrderItem {
    id: number;
    book: {
        id: number;
        images: string;
        title: string;
        author?: {
            name: string;
        };
        stock: number;
    } | null;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    status: string;
    created_at: string;
    order_items: OrderItem[];
    address: string;
    total_price: number;
}

export default function Dashboard({
    auth,
    orders,
}: {
    auth: any;
    orders: Order[];
}) {
    const orderStatuses = [
        "cart",
        "pending",
        "shipped",
        "delivered",
        "cancelled",
    ];

    console.log(orders);

    const { patch, processing, errors, setError } = useForm({
        quantityError: "",
    });

    const [quantityErrors, setQuantityErrors] = useState<{
        [key: number]: string;
    }>({});

    useEffect(() => {
        const channel = window.Echo.channel("books");

        channel.listen(
            ".book.updated",
            (e: { book: { id: number; stock: number } }) => {
                // Update the orders state to reflect the new stock
                orders.forEach((order) => {
                    order.order_items.forEach((item: OrderItem) => {
                        if (item.book?.id === e.book.id) {
                            item.book.stock = e.book.stock;

                            // If current quantity exceeds new stock, show error
                            if (item.quantity > e.book.stock) {
                                setQuantityErrors((prev) => ({
                                    ...prev,
                                    [item.id]: `Only ${e.book.stock} items available`,
                                }));
                            } else {
                                // Clear error if stock is now sufficient
                                setQuantityErrors((prev) => ({
                                    ...prev,
                                    [item.id]: "",
                                }));
                            }
                        }
                    });
                });
            }
        );

        // Cleanup listener when component unmounts
        return () => {
            channel.stopListening("BookUpdated");
        };
    }, [orders]);

    return (
        <MainLayout
            auth={auth}
            header={
                <h2 className="text-3xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Your Cart
                </h2>
            }
        >
            <Head title="Your Cart" />
            <div className="py-12">
                <TabGroup>
                    <TabList className="flex flex-wrap gap-4 md:flex-row">
                        {orderStatuses.map((status) => (
                            <Tab
                                key={status}
                                className="rounded-lg py-1 px-3 text-md font-semibold text-gray-800 hover:bg-gray-200 focus:outline-none data-[selected]:bg-gray-200 data-[hover]:bg-gray-100 data-[selected]:data-[hover]:bg-gray-200 data-[focus]:outline-1 data-[focus]:outline-gray-800 capitalize dark:text-white dark:hover:bg-gray-700 dark:focus:outline-white dark:data-[selected]:bg-gray-800 dark:data-[hover]:bg-gray-700 dark:data-[selected]:data-[hover]:bg-gray-800 dark:data-[focus]:outline-white"
                            >
                                {status}
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels className="mt-4">
                        {orderStatuses.map((status) => (
                            <TabPanel
                                key={status}
                                className="p-3 text-gray-800 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white"
                            >
                                {orders.filter(
                                    (order: Order) => order.status === status
                                ).length > 0 ? (
                                    orders
                                        .filter(
                                            (order: Order) =>
                                                order.status === status
                                        )
                                        .map((order: Order) => (
                                            <div
                                                key={order.id}
                                                className="mb-9"
                                            >
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-semibold">
                                                        Order {order.id}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Status:{" "}
                                                        <span
                                                            className={`font-semibold uppercase ${
                                                                order.status ===
                                                                "cancelled"
                                                                    ? "text-red-500"
                                                                    : order.status ===
                                                                          "delivered" ||
                                                                      order.status ===
                                                                          "shipped"
                                                                    ? "text-green-500"
                                                                    : "text-yellow-500"
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </p>
                                                </div>

                                                {order.order_items.length >
                                                0 ? (
                                                    order.order_items.map(
                                                        (item: OrderItem) => (
                                                            <div key={item.id}>
                                                                <div className="flex flex-col items-start justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700 sm:items-center sm:flex-row">
                                                                    <div className="flex items-start gap-4">
                                                                        <img
                                                                            src={
                                                                                item
                                                                                    .book
                                                                                    ?.images
                                                                                    ? `/storage/${item.book.images}`
                                                                                    : `/storage/logo.png`
                                                                            }
                                                                            alt={
                                                                                item
                                                                                    .book
                                                                                    ?.title ||
                                                                                "Unavailable"
                                                                            }
                                                                            className="object-cover w-20 h-20 rounded-md"
                                                                        />
                                                                        <div className="flex flex-col gap-1">
                                                                            <p className="text-sm text-gray-500">
                                                                                {item
                                                                                    .book
                                                                                    ?.author
                                                                                    ?.name ||
                                                                                    "Unknown Author"}
                                                                            </p>
                                                                            <p className="text-lg font-semibold">
                                                                                {item
                                                                                    .book
                                                                                    ?.title ||
                                                                                    "Unavailable Book"}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">
                                                                                Quantity:{" "}
                                                                                {
                                                                                    item.quantity
                                                                                }
                                                                            </p>
                                                                            {status ===
                                                                                "cart" && (
                                                                                <p className="text-sm text-red-500">
                                                                                    {!item.book
                                                                                        ? "This book is no longer available"
                                                                                        : item
                                                                                              .book
                                                                                              .stock <=
                                                                                          0
                                                                                        ? "Out of stock"
                                                                                        : ""}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <p>
                                                                            $
                                                                            {status ===
                                                                            "cart"
                                                                                ? item.price
                                                                                : `Total Price: ${
                                                                                      item.price *
                                                                                      item.quantity
                                                                                  }`}
                                                                        </p>
                                                                        {status ===
                                                                            "cart" && (
                                                                            <div className="flex items-center gap-4">
                                                                                <form
                                                                                    onSubmit={(
                                                                                        e
                                                                                    ) =>
                                                                                        e.preventDefault()
                                                                                    }
                                                                                >
                                                                                    <div className="relative flex flex-col gap-2">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Button
                                                                                                type="button"
                                                                                                className="px-2 py-0 bg-gray-300 rounded-md dark:bg-gray-700"
                                                                                                disabled={
                                                                                                    processing ||
                                                                                                    !item.book
                                                                                                }
                                                                                                onClick={() => {
                                                                                                    if (
                                                                                                        item.quantity >
                                                                                                        1
                                                                                                    ) {
                                                                                                        // Clear any existing error for this item
                                                                                                        setQuantityErrors(
                                                                                                            (
                                                                                                                prev
                                                                                                            ) => ({
                                                                                                                ...prev,
                                                                                                                [item.id]:
                                                                                                                    "",
                                                                                                            })
                                                                                                        );

                                                                                                        patch(
                                                                                                            route(
                                                                                                                "orders.updateQuantity",
                                                                                                                {
                                                                                                                    orderId:
                                                                                                                        order.id,
                                                                                                                    orderItemId:
                                                                                                                        item.id,
                                                                                                                    quantity:
                                                                                                                        item.quantity -
                                                                                                                        1,
                                                                                                                }
                                                                                                            ),
                                                                                                            {
                                                                                                                preserveScroll:
                                                                                                                    true,
                                                                                                            }
                                                                                                        );
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                -
                                                                                            </Button>

                                                                                            <TextInput
                                                                                                value={
                                                                                                    item.quantity
                                                                                                }
                                                                                                disabled
                                                                                                className="w-16 text-center"
                                                                                            />

                                                                                            <Button
                                                                                                type="button"
                                                                                                className="px-2 py-0 bg-gray-300 rounded-md dark:bg-gray-700"
                                                                                                disabled={
                                                                                                    processing ||
                                                                                                    !item.book
                                                                                                }
                                                                                                onClick={() => {
                                                                                                    if (
                                                                                                        !item.book ||
                                                                                                        item.quantity >=
                                                                                                            item
                                                                                                                .book
                                                                                                                .stock
                                                                                                    ) {
                                                                                                        setQuantityErrors(
                                                                                                            (
                                                                                                                prev
                                                                                                            ) => ({
                                                                                                                ...prev,
                                                                                                                [item.id]:
                                                                                                                    "Not enough stock available",
                                                                                                            })
                                                                                                        );
                                                                                                        return;
                                                                                                    }

                                                                                                    // Clear any existing error for this item
                                                                                                    setQuantityErrors(
                                                                                                        (
                                                                                                            prev
                                                                                                        ) => ({
                                                                                                            ...prev,
                                                                                                            [item.id]:
                                                                                                                "",
                                                                                                        })
                                                                                                    );

                                                                                                    patch(
                                                                                                        route(
                                                                                                            "orders.updateQuantity",
                                                                                                            {
                                                                                                                orderId:
                                                                                                                    order.id,
                                                                                                                orderItemId:
                                                                                                                    item.id,
                                                                                                                quantity:
                                                                                                                    item.quantity +
                                                                                                                    1,
                                                                                                            }
                                                                                                        ),
                                                                                                        {
                                                                                                            preserveScroll:
                                                                                                                true,
                                                                                                        }
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                +
                                                                                            </Button>
                                                                                        </div>
                                                                                        {quantityErrors[
                                                                                            item
                                                                                                .id
                                                                                        ] && (
                                                                                            <InputError
                                                                                                message={
                                                                                                    quantityErrors[
                                                                                                        item
                                                                                                            .id
                                                                                                    ]
                                                                                                }
                                                                                                className="absolute inset-y-11 text-nowrap animate-fade-out"
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                </form>
                                                                                <Button
                                                                                    className="px-3 py-1 text-red-600 rounded-md hover:text-red-700"
                                                                                    onClick={() => {
                                                                                        router.delete(
                                                                                            route(
                                                                                                "orders.removeItem",
                                                                                                {
                                                                                                    orderId:
                                                                                                        order.id,
                                                                                                    orderItemId:
                                                                                                        item.id,
                                                                                                }
                                                                                            )
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <TrashIcon className="w-6 h-6" />
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <p>No items in order</p>
                                                )}

                                                <div className="flex flex-col justify-between gap-2 mt-4 md:flex-row">
                                                    <div className="space-y-2">
                                                        <p className="text-sm text-gray-500">
                                                            Created at:{" "}
                                                            {order.created_at}
                                                        </p>
                                                        {(status ===
                                                            "shipped" ||
                                                            status ===
                                                                "delivered") &&
                                                            order.address && (
                                                                <div className="text-sm">
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                                        Shipping
                                                                        to:{" "}
                                                                    </span>
                                                                    <span className="text-gray-600 dark:text-gray-400">
                                                                        {
                                                                            order.address
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        {order.total_price &&
                                                            status !==
                                                                "cart" && (
                                                                <div className="space-y-1">
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Subtotal:
                                                                        $
                                                                        {order.order_items.reduce(
                                                                            (
                                                                                acc,
                                                                                item
                                                                            ) =>
                                                                                acc +
                                                                                item.price *
                                                                                    item.quantity,
                                                                            0
                                                                        )}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        Admin
                                                                        Tax: 10%
                                                                    </p>
                                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Total: $
                                                                        {
                                                                            order.total_price
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div>
                                                        {status === "cart" ? (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    className="inline-flex items-center gap-2 px-3 py-1 text-red-600 rounded-md hover:text-red-700"
                                                                    onClick={() => {
                                                                        router.delete(
                                                                            route(
                                                                                "orders.removeOrder",
                                                                                order.id
                                                                            )
                                                                        );
                                                                    }}
                                                                >
                                                                    <TrashIcon className="w-6 h-6" />
                                                                    Remove Order
                                                                </Button>
                                                                {order.order_items.every(
                                                                    (
                                                                        item: OrderItem
                                                                    ) =>
                                                                        item.book &&
                                                                        item
                                                                            .book
                                                                            .stock >
                                                                            0
                                                                ) ? (
                                                                    <Button
                                                                        className="px-3 py-1 text-white bg-green-500 rounded-md hover:bg-green-600"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                        onClick={() => {
                                                                            router.get(
                                                                                route(
                                                                                    "orders.checkout",
                                                                                    order.id
                                                                                )
                                                                            );
                                                                        }}
                                                                    >
                                                                        Checkout
                                                                    </Button>
                                                                ) : null}
                                                            </div>
                                                        ) : status !==
                                                              "delivered" &&
                                                          status !==
                                                              "cancelled" ? (
                                                            <Button
                                                                className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                                                                onClick={() => {
                                                                    router.patch(
                                                                        route(
                                                                            "orders.cancel",
                                                                            order.id
                                                                        )
                                                                    );
                                                                }}
                                                            >
                                                                Cancel Order
                                                            </Button>
                                                        ) : status ===
                                                          "delivered" ? (
                                                            <Button className="px-3 py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600">
                                                                Review
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-xl font-semibold text-gray-400">
                                            {status === "cart"
                                                ? "Your cart is empty"
                                                : status === "pending"
                                                ? "No pending orders"
                                                : status === "shipped"
                                                ? "No shipped orders"
                                                : status === "delivered"
                                                ? "No delivered orders"
                                                : "No cancelled orders"}
                                        </p>
                                        {status === "cart" && (
                                            <Button
                                                className="px-4 py-2 mt-4 text-white bg-red-500 rounded-md hover:bg-red-600"
                                                onClick={() =>
                                                    router.visit(route("home"))
                                                }
                                            >
                                                Browse Books Now
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </div>
        </MainLayout>
    );
}
