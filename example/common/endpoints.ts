import {DefaultClient, Endpoint} from "rickety";

import {ID, Name, User} from "./types";

export const client = new DefaultClient

export const userByID = new Endpoint<ID, User>({
    client: client,
    path: "/api/v1/userByID",
});

export const userByName = new Endpoint<Name, User>({
    client: client,
    path: "/api/v1/userByName",
});
