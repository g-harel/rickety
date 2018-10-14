import {Endpoint} from "../..";
import {ID, Name, User} from "./types";

export const userByID = new Endpoint<ID, User>("/api/v1/userByID");
export const userByName = new Endpoint<Name, User>("/api/v1/userByName");
