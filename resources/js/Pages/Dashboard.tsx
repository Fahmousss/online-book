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

interface OrderItem {
    id: number;
    book: {
        images: string;
        title: string;
        author?: {
            name: string;
        };
        stock: number;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    status: string;
    created_at: string;
    order_items: OrderItem[];
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

    const { patch, processing } = useForm();
    console.log(orders);

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
                    <TabList className="flex gap-4">
                        {orderStatuses.map((status) => (
                            <Tab
                                key={status}
                                className="rounded-lg py-1 px-3 text-md font-semibold text-white focus:outline-none data-[selected]:bg-gray-800 data-[hover]:bg-gray-700 data-[selected]:data-[hover]:bg-gray-800 data-[focus]:outline-1 data-[focus]:outline-white capitalize"
                            >
                                {status}
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels className="mt-4">
                        {orderStatuses.map((status) => (
                            <TabPanel
                                key={status}
                                className="p-3 bg-gray-800 rounded-lg"
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
                                                                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                                                    <div className="flex items-start gap-4">
                                                                        <img
                                                                            src={
                                                                                item
                                                                                    .book
                                                                                    .images
                                                                                    ? `/storage/${item.book.images}`
                                                                                    : `https://via.placeholder.com/400x600/000000/FFFFFF/?text=${item.book.title}`
                                                                            }
                                                                            alt={
                                                                                item
                                                                                    .book
                                                                                    .title
                                                                            }
                                                                            className="object-cover w-20 h-20 rounded-md"
                                                                        />
                                                                        <div className="flex flex-col gap-1">
                                                                            <p className="text-sm text-gray-500">
                                                                                {
                                                                                    item
                                                                                        .book
                                                                                        .author
                                                                                        ?.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-lg font-semibold">
                                                                                {
                                                                                    item
                                                                                        .book
                                                                                        .title
                                                                                }
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">
                                                                                Quantity:{" "}
                                                                                {
                                                                                    item.quantity
                                                                                }
                                                                            </p>
                                                                            {status ===
                                                                                "cart" &&
                                                                                item
                                                                                    .book
                                                                                    .stock <=
                                                                                    0 && (
                                                                                    <p className="text-sm text-red-500">
                                                                                        Out
                                                                                        of
                                                                                        stock
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
                                                                                : item.price *
                                                                                  item.quantity}
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
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Button
                                                                                            type="button"
                                                                                            className="px-2 py-1 bg-gray-700 rounded-md"
                                                                                            disabled={
                                                                                                processing
                                                                                            }
                                                                                            onClick={() => {
                                                                                                if (
                                                                                                    item.quantity >
                                                                                                    1
                                                                                                ) {
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
                                                                                                            onError:
                                                                                                                (
                                                                                                                    errors
                                                                                                                ) => {
                                                                                                                    console.error(
                                                                                                                        errors
                                                                                                                    );
                                                                                                                },
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
                                                                                            onChange={(
                                                                                                e
                                                                                            ) => {
                                                                                                const newQuantity =
                                                                                                    Math.max(
                                                                                                        1,
                                                                                                        parseInt(
                                                                                                            e
                                                                                                                .target
                                                                                                                .value
                                                                                                        ) ||
                                                                                                            1
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
                                                                                                                newQuantity,
                                                                                                        }
                                                                                                    ),
                                                                                                    {
                                                                                                        preserveScroll:
                                                                                                            true,
                                                                                                        onError:
                                                                                                            (
                                                                                                                errors
                                                                                                            ) => {
                                                                                                                console.error(
                                                                                                                    errors
                                                                                                                );
                                                                                                            },
                                                                                                    }
                                                                                                );
                                                                                            }}
                                                                                            className="w-16 text-center"
                                                                                        />
                                                                                        <Button
                                                                                            type="button"
                                                                                            className="px-2 py-1 bg-gray-700 rounded-md"
                                                                                            disabled={
                                                                                                processing
                                                                                            }
                                                                                            onClick={() => {
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
                                                                                                        onError:
                                                                                                            (
                                                                                                                errors
                                                                                                            ) => {
                                                                                                                console.error(
                                                                                                                    errors
                                                                                                                );
                                                                                                            },
                                                                                                    }
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            +
                                                                                        </Button>
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

                                                <div className="flex justify-between gap-2 mt-4">
                                                    <p className="text-sm text-gray-500">
                                                        Created at:{" "}
                                                        {order.created_at}
                                                    </p>
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
                                                                    item.book
                                                                        .stock >=
                                                                    0
                                                            ) ? (
                                                                <Button
                                                                    className="px-3 py-1 text-white bg-green-500 rounded-md hover:bg-green-600"
                                                                    onClick={() => {
                                                                        router.patch(
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
                                                      status !== "cancelled" ? (
                                                        <Button
                                                            className="px-3 py-1 bg-red-500 rounded-md hover:bg-red-600"
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
                                                        <Button className="px-3 py-1 bg-blue-500 rounded-md hover:bg-blue-600">
                                                            Review
                                                        </Button>
                                                    ) : null}
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
