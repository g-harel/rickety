import {DefaultClient} from "../..";
import {FetchClient} from "../../client/fetch";
import {ClientRequest} from "../../client";

const fetch = jest.fn();
(global as any).fetch = fetch;

it("should be the default client", () => {
    expect(DefaultClient).toBe(FetchClient);
});

it("should correctly translate the request", async () => {
    const request: ClientRequest = {
        body: "test",
        headers: {
            "Test-Name": "test_value",
        },
        method: "DELETE",
        url: "/test/path",
    };

    fetch.mockResolvedValueOnce({
        text: () => "",
        status: 200,
    });

    const client = new FetchClient();
    await client.send(request);

    expect(fetch).toHaveBeenCalledWith(
        request.url,
        expect.objectContaining({
            method: request.method,
            headers: request.headers,
            body: request.body,
        }),
    );
});

it("should correctly translate the response", async () => {
    const body = "test123";
    const response = {
        text: () => body,
        status: 301,
    };

    fetch.mockResolvedValueOnce(response);

    const client = new FetchClient();
    const res = await client.send({
        body: "",
        headers: {},
        method: "",
        url: "",
    });

    expect(res).toMatchObject({
        body,
        status: response.status,
    });
});
