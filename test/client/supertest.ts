import express from "express";

import {Client} from "../../client";
import {Endpoint} from "../..";
import {SupertestClient} from "../../client/supertest";

let app: express.Express;
let client: Client;
let endpoint: Endpoint<any, any>;

beforeEach(() => {
    app = express();
    client = new SupertestClient(app);
    endpoint = new Endpoint({client, path: "/" + Math.random()});
});

it("should send requests to the handler", async () => {
    const test = jest.fn();

    app.use(endpoint.handler(test));
    await endpoint.call({});

    expect(test).toHaveBeenCalled();
});

it("should pass along request headers", async () => {
    const headerName = "Test-Name";
    const headerValue = "12345";
    const test = jest.fn();

    app.use(
        endpoint.handler((_, req) => {
            test(req.header(headerName));
            return {};
        }),
    );

    const spy = jest.spyOn(client, "send");
    spy.mockImplementation((request) => {
        request.headers[headerName] = headerValue;
        return new SupertestClient(app).send(request);
    });

    await endpoint.call({});

    expect(test).toHaveBeenCalledWith(headerValue);
});

it("should pass along the request body", async () => {
    const payload = {test: true, arr: [0, ""]};
    const test = jest.fn();

    app.use(
        endpoint.handler((data) => {
            test(data);
            return {};
        }),
    );
    await endpoint.call(payload);

    expect(test).toHaveBeenCalledWith(payload);
});

it("should return the response data", async () => {
    const payload = {test: true, arr: [0, ""]};

    app.use(endpoint.handler(() => payload));
    const res = await endpoint.call({});

    expect(res).toEqual(payload);
});
