import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import MainLayout from "@/Layouts/MainLayout";
import { Button } from "@headlessui/react";
import { Head, router } from "@inertiajs/react";

interface OrderItem {
    id: number;
    book: {
        title: string;
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
                {orders.map((order: Order) => (
                    <div key={order.id}>
                        <h3 className="text-lg font-semibold">
                            Order {order.id}
                        </h3>
                        <p>Status: {order.status}</p>
                        <p>Created at: {order.created_at}</p>

                        <div className="grid grid-cols-4 gap-4">
                            {order.order_items.map((item: OrderItem) => (
                                <>
                                    <div key={item.id}>
                                        {item.book?.title || "Book not found"}
                                    </div>
                                    <div>{item.quantity}</div>
                                    <div>{item.price}</div>

                                    {order.status === "cart" && (
                                        <Button
                                            onClick={() => {
                                                router.delete(
                                                    route("orders.removeItem", {
                                                        orderId: order.id,
                                                        orderItemId: item.id,
                                                    })
                                                );
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            {order.status === "cart" ? (
                                <>
                                    <Button
                                        onClick={() => {
                                            router.delete(
                                                route(
                                                    "orders.removeOrder",
                                                    order.id
                                                )
                                            );
                                        }}
                                    >
                                        Remove
                                    </Button>
                                    <Button
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
                                </>
                            ) : order.status !== "delivered" ? (
                                <Button
                                    onClick={() => {
                                        router.patch(
                                            route("orders.edit", order.id)
                                        );
                                    }}
                                >
                                    Cancel
                                </Button>
                            ) : order.status === "delivered" ? (
                                <Button>Review</Button>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    );
}
