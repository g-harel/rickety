import express from "express";

import {userByID, userByName} from "../common/endpoints";
import {readUser} from "./database";

export const app = express();

app.use(express.static(__dirname + "/../dist"));

app.use(
    userByID.handler(async (userID) => {
        const user = await readUser();
        user.id = userID;

        return user;
    }),
);

// The handler can use express request and response objects.
app.use(
    userByName.handler(async (data, req, res) => {
        console.log("called with method", req.method);
        res.setHeader("User-Agent", "Example/0.0");

        const name = data.name.replace(/\s/g, "").toLowerCase();

        const user = await readUser();
        user.name = data.name;
        user.account.email = name + "@example.com";
        user.account.username = name;

        return user;
    }),
);
