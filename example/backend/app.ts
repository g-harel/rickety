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

app.use(
    userByName.handler(async (data) => {
        const name = data.name.replace(/\s/g, ".").toLowerCase();

        const user = await readUser();
        user.name = data.name;
        user.account.email = name + "@example.com";
        user.account.username = name;

        return user;
    }),
);

const errHandler: express.ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    res.sendStatus(418);
};
app.use(errHandler);
