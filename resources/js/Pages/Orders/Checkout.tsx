import { Head, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { Button } from "@headlessui/react";

interface OrderItem {
    id: number;
    book: {
        images: string;
        title: string;
        author?: {
            name: string;
        };
    };
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    status: string;
    total_price: number;
    created_at: string;
    order_items: OrderItem[];
}

export default function Checkout({ auth, order }: { auth: any; order: Order }) {
    return (
        <MainLayout
            auth={auth}
            header={
                <h2 className="text-3xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Checkout
                </h2>
            }
        >
            <Head title="Checkout" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="p-6 overflow-hidden bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="flex flex-col gap-8 md:flex-row">
                            {/* Order Summary */}
                            <div className="w-full md:w-2/3">
                                <h3 className="mb-4 text-xl font-semibold">
                                    Order Summary
                                </h3>
                                {order.order_items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 border-b border-gray-700"
                                    >
                                        <img
                                            src={
                                                item.book.images
                                                    ? `/storage/${item.book.images}`
                                                    : `https://via.placeholder.com/400x600/000000/FFFFFF/?text=${item.book.title}`
                                            }
                                            alt={item.book.title}
                                            className="object-cover w-20 h-20 rounded-md"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">
                                                {item.book.author?.name}
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {item.book.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-lg">
                                            ${item.price * item.quantity}
                                        </p>
                                    </div>
                                ))}
                                <div className="mt-4 text-right">
                                    <p className="text-xl font-semibold">
                                        Total: ${order.total_price}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="w-full md:w-1/3">
                                <h3 className="mb-4 text-xl font-semibold">
                                    Payment Details
                                </h3>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full text-white bg-gray-900 border-gray-700 rounded-md"
                                            placeholder="1234 5678 9012 3456"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full text-white bg-gray-900 border-gray-700 rounded-md"
                                                placeholder="MM/YY"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium">
                                                CVC
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full text-white bg-gray-900 border-gray-700 rounded-md"
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                                        onClick={() => {
                                            // Handle payment processing here
                                            router.patch(
                                                route("orders.pay", order.id)
                                            );
                                        }}
                                    >
                                        Pay ${order.total_price}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
