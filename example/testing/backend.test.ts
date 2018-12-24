import {SupertestClient} from "rickety/client/supertest";

import {client, userByID} from "../common/endpoints";
import {app} from "../backend/app";

SupertestClient.override(client, app);

test("userByID endpoint returns a user with a correct ID", async () => {
    const id = Math.random();

    const res = await userByID.call(id);

    expect(res.id).toBe(id);
});
