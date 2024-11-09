import { Config } from "ziggy-js";

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    address: string;
}

export interface Book {
    title: string;
    author?: Author;
    images: string;
    price: number;
    slug: string;
}

export interface Author {
    name: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
        admin: boolean;
        cart_count: number;
    };
    ziggy: Config & { location: string };
    recommendedBooks: Book[];
};
