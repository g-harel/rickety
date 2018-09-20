import express from "express";

import {userByID, userByName, UserResponse} from "./common";

export const app = express();

const readUser = (): UserResponse => ({
    id: 1234,
    name: "David Smith",
    account: {
        email: "david.smith@example.com",
        username: null,
    },
});

app.use(
    userByID((userID) => {
        const user = readUser();
        user.id = userID;
        return user;
    }),
);

app.use(
    userByName(async (req) => {
        const user = await readUser();
        const name = req.name.replace(/\s/g, "").toLowerCase();
        user.name = req.name;
        user.account.email = name + "@example.com";
        user.account.username = name;
        return user;
    }),
);
