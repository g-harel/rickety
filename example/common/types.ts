export type ID = number;

export type Name = {
    name: string;
};

export type User = {
    id: number;
    name: string;
    account: {
        email: string;
        username: string | null;
    };
};
