import {userByID, userByName} from "../common/endpoints";

(async () => {
    const user1 = await userByID.call(1234);
    console.log(">", user1.name);

    const user2 = await userByName.call(
        {name: "John Doe"},
        {"User-Agent": "Example/0.0"},
    );
    console.log(">", user2.account.email);
})();
