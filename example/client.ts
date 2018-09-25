import {userByID, userByName} from "./shared";

export const run = async () => {
    // Calling the endpoint with the correct request type will
    // return a promise for the response type.
    const user1 = await userByID.call(1234);
    console.log(">", user1.name);

    // It is important to remember that there is no runtime type
    // checking for both the input and the output values. This
    // can be mitigated by setting the appropriate value for the
    // expected status code in the endpoint config. This example
    // also demonstrates the ability to include headers with the
    // request.
    const user2 = await userByName.call(
        {name: "John Doe"},
        // HTTP Headers.
        {"User-Agent": "Example/0.0"},
    );
    console.log(">", user2.account.email);
};
