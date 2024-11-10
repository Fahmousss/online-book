import { Head, router, useForm } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { Button } from "@headlessui/react";
import { FormEventHandler, useState } from "react";

interface OrderItem {
    id: number;
    book: {
        images: string | null;
        title: string;
        author?: {
            name: string;
        } | null;
        deleted_at?: string | null;
    } | null;
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
    const [useNewAddress, setUseNewAddress] = useState(false);
    const { data, setData, patch, processing, errors, reset } = useForm({
        address: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route("orders.pay", order.id), {
            onFinish: () => reset("address"),
        });
    };

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
                    <div className="p-6 overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="flex flex-col gap-8 md:flex-row">
                            {/* Order Summary */}
                            <div className="w-full md:w-2/3">
                                <h3 className="mb-4 text-xl font-semibold">
                                    Order Summary
                                </h3>
                                {order.order_items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700"
                                    >
                                        <img
                                            src={
                                                item.book?.images
                                                    ? `/storage/${item.book.images}`
                                                    : `/storage/logo.png`
                                            }
                                            alt={
                                                item.book?.title ||
                                                "Unavailable"
                                            }
                                            className="object-cover w-20 h-20 rounded-md"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.book?.author?.name ||
                                                    "Unknown Author"}
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {item.book?.title ||
                                                    "Unavailable Book"}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Quantity: {item.quantity}
                                            </p>
                                            {item.book?.deleted_at && (
                                                <p className="text-sm text-red-500">
                                                    This book is no longer
                                                    available
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-lg text-gray-900 dark:text-white">
                                                $
                                                {(
                                                    item.price * item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 text-right">
                                    <p className="text-xl font-semibold">
                                        Total: $
                                        {(order.total_price * 1.1).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Admin Tax(10%) =
                                        {(order.total_price * 0.1).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="w-full md:w-1/3">
                                <h3 className="mb-4 text-xl font-semibold">
                                    Payment Details
                                </h3>
                                <form className="space-y-4" onSubmit={submit}>
                                    {/* Address Selection */}
                                    <div className="mb-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={useNewAddress}
                                                onChange={(e) =>
                                                    setUseNewAddress(
                                                        e.target.checked
                                                    )
                                                }
                                                className="text-green-500 bg-white border-gray-300 rounded dark:bg-gray-900 dark:border-gray-700"
                                            />
                                            <span className="text-sm">
                                                Use a different shipping address
                                            </span>
                                        </label>
                                    </div>

                                    {/* Current Address (when not using new address) */}
                                    {!useNewAddress && (
                                        <div className="p-4 mb-4 border border-gray-200 rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                            <p className="font-medium">
                                                Current Address:
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {auth.user.address}
                                            </p>
                                        </div>
                                    )}

                                    {/* New Address Fields */}
                                    {useNewAddress && (
                                        <>
                                            <div>
                                                <label className="block mb-1 text-sm font-medium">
                                                    Street Address
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={data.address}
                                                    onChange={(e) =>
                                                        setData(
                                                            "address",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full text-white bg-gray-900 border-gray-700 rounded-md"
                                                    placeholder="123 Main St"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Existing Payment Fields */}
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
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    >
                                        Pay $
                                        {(order.total_price * 1.1).toFixed(2)}
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
