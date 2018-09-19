import H from "..";

export type RequestByID = number;
export type RequestByName = {
    name: string;
};

export type UserResponse = {
    id: number;
    name: string;
    account: {
        email: string;
        username: string | null;
    };
};

export const userByID = H<RequestByID, UserResponse>("/api/v1/userByID");
export const userByName = H<RequestByName, UserResponse>({
    method: "POST",
    path: "/api/v1/userByName",
    expect: 200,
});
