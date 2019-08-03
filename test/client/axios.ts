import * as axios from "axios";

import {AxiosClient} from "../../client/axios";
import {ClientRequest} from "../../client";

jest.mock("axios");

it("should correctly translate the request", async () => {
    const request: ClientRequest = {
        body: "test",
        headers: {
            "Test-Name": "test_value",
        },
        method: "DELETE",
        url: "/test/path",
    };

    ((axios as any) as jest.Mock).mockResolvedValueOnce({
        text: () => "",
        status: 200,
    });

    const client = new AxiosClient();
    await client.send(request);

    expect(axios).toHaveBeenCalledWith(
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
        data: body,
        status: 301,
    };

    ((axios as any) as jest.Mock).mockResolvedValueOnce(response);

    const client = new AxiosClient();
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
