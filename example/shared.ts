import * as rickety from "..";

// Request types can be defined per endpoint, or can be
// more generic types to be re-used by multiple endpoints.
export type RequestByID = number;
export type RequestByName = {
    name: string;
};

// Response types can also be shared between multiple distinct
// endpoints. All of typescript's advanced type features can
// also be used to correctly describe the data.
export type UserResponse = {
    id: number;
    name: string;
    account: {
        email: string;
        username: string | null;
    };
};

// Endpoint definitions combine their configuration with the
// request and response data types. The endpoints do not
// necessarily need to represent routes handled by this package.
export const userByID = new rickety.Endpoint<RequestByID, UserResponse>({
    port: 3000,
    path: "/api/v1/userByID",
});
export const userByName = new rickety.Endpoint<RequestByName, UserResponse>({
    method: "POST",
    host: "localhost",
    port: 3000,
    path: "/api/v1/userByName",
    expect: 200,
});
