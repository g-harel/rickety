import {Client, Endpoint, Group} from "..";
import {LinkRequest} from "../link";

// TODO
test("group", async () => {
    const client = new Client();

    client.use(async (request: LinkRequest) => {
        return {
            status: 200,
            body: `{"response": ${request.body}}`,
        };
    });

    const endpoint = new Endpoint<string, {response: string}>({
        client,
        path: "/test",
    });

    const query = new Group({
        a: endpoint,
        b: {
            c: endpoint,
            d: {
                e: endpoint,
                f: endpoint,
            },
        },
        tes: {},
    });

    const query2 = new Group({
        nested: query,
    });

    const fn = async () => {
        const a = await query2.call({
            nested: {
                a: "a-data",
                b: {
                    c: "c-data",
                    d: {
                        e: "e-data",
                        f: "f-data",
                    },
                },
                tes: {},
            },
        });
        console.log(JSON.stringify(a, null, 2));
    };

    await fn();
});
