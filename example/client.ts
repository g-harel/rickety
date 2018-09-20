import {userByID, userByName} from "./common";

export const run = async () => {
    const user1 = await userByID(1234);
    console.log(">", user1.name);

    const user2 = await userByName({name: "John Doe"});
    console.log(">", user2.account.email);
};
