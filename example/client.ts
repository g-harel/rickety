import {userByID, userByName} from "./common";

export const run = async () => {
    // Calling the endpoint with the correct request type will
    // return a promise for the response type.
    const user1 = await userByID(1234);
    console.log(">", user1.name);

    // It is important to remember that there is no runtime type
    // checking for both the input and the output values. This
    // can be mitigated by setting the appropriate value for the
    // expected status code in the endpoint config.
    const user2 = await userByName({name: "John Doe"});
    console.log(">", user2.account.email);
};
