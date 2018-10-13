import {User} from "../common/types";

export const readUser = async (): Promise<User> => ({
    id: 1234,
    name: "David Smith",
    account: {
        email: "david.smith@example.com",
        username: null,
    },
});
