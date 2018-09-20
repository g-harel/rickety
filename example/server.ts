import express from "express";

import {userByID, userByName, UserResponse} from "./common";

export const app = express();

// The readUser function is used to generate a user response
// and simulate a call to other server-side code.
const readUser = (): UserResponse => ({
    id: 1234,
    name: "David Smith",
    account: {
        email: "david.smith@example.com",
        username: null,
    },
});

// Each endpoint is registered with the express application.
// This is where the handler implementation is associated
// with it's endpoint.
app.use(
    userByID((userID) => {
        const user = readUser();
        user.id = userID;

        return user;
    }),
);

// The handler can also be an asynchronous function and make
// use of the raw express request and response objects.
app.use(
    userByName(async (data, _, res) => {
        res.setHeader("User-Agent", "Example")

        const name = data.name.replace(/\s/g, "").toLowerCase();

        const user = await readUser();
        user.name = data.name;
        user.account.email = name + "@example.com";
        user.account.username = name;

        return user;
    }),
);
