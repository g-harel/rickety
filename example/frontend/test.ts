import {link, unlink} from "rickety/link";

import {userByName} from "../common/endpoints";
import {app} from "../backend/app";

link.express(app);
unlink();

const call = () =>
    userByName.call({
        name: "test",
    });

test("test", async () => {
    const spy = jest.spyOn(userByName, "call");
    spy.mockReturnValue({});

    await call();
    expect(spy).toHaveBeenCalled();
});
