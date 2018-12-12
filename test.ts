import express from "express";
import supertest from "supertest";

import {Client, Endpoint} from ".";
import {link} from "./link";

describe("Endpoint.call", () => {
    let sender: jest.SpyInstance;
    let lastSent: LinkRequest;
    let client: Client;

    beforeEach(() => {
        client = new Client();
        sender = jest.fn(async (request) => {
            lastSent = request;
            return {status: 200, body: "{}"};
        });
        client.use(sender as any);
    });

    it("should concatenate the base and the path to form the url", async () => {
        const config: Config = {
            base: "base123",
            path: "/path123",
        };
        await client.Endpoint(config).call({});
        expect(lastSent.url).toBe(config.base + config.path);
    });

    it("should pass along request data to sender", async () => {
        const path = "/path123";
        const request = {
            test: true,
            list: [0, "test", null],
        };
        await client.Endpoint(path).call(request);
        expect(lastSent.headers["Content-Type"]).toContain("application/json");
        expect(lastSent.body).toBe(JSON.stringify(request));
    });

    it("should use the configured http method", async () => {
        const config: Config = {
            method: "HEAD",
            path: "/path123",
        };
        await client.Endpoint(config).call({});
        expect(lastSent.method).toBe(config.method);
    });

    it("should throw an error if the status code not expected", async () => {
        const config: Config = {
            path: "/path123",
            expect: [301, 302],
        };
        sender.mockReturnValueOnce({
            status: 400,
            body: "{}",
        });
        const endpoint = client.Endpoint(config);
        await expect(endpoint.call({})).rejects.toThrow(/status.*400/);
    });
});

describe("Endpoint.handler", () => {
    let app: express.Express;
    let client: Client;

    beforeEach(() => {
        app = express();
        client = new Client();
    });

    it("should run handler when endpoint is called", async () => {
        const path = "/path123";
        const test = jest.fn(() => {});
        const endpoint = client.Endpoint(path);
        app.use(endpoint.handler(test));

        await supertest(app)
            .post(path)
            .send("{}");
        expect(test).toHaveBeenCalled();
    });

    it("should match with the full request path when handling on a base", async () => {
        const base = "/very/nested";
        const path = base + "/path";
        const test = jest.fn(() => {});
        const endpoint = client.Endpoint(path);
        app.use(base, endpoint.handler(test));

        await supertest(app)
            .post(path)
            .send("{}");
        expect(test).toHaveBeenCalled();
    });

    it("should match when the base and the partial path match", async () => {
        const base = "/ver/nested";
        const path = "/path";
        const test = jest.fn(() => {});
        const endpoint = client.Endpoint({
            base,
            path,
        });
        app.use(base, endpoint.handler(test));

        await supertest(app)
            .post(base + path)
            .send("{}");
        expect(test).toHaveBeenCalled();
    });

    it("should only run handler when endpoint is matched", async () => {
        const path1 = "/path1";
        const test1 = jest.fn(() => {});
        const endpoint1 = client.Endpoint({
            method: "PUT",
            path: path1,
        });
        app.use(endpoint1.handler(test1));

        const test2 = jest.fn(() => {});
        const endpoint2 = client.Endpoint(path1);
        app.use(endpoint2.handler(test2));

        const path3 = "/path3";
        const test3 = jest.fn(() => {});
        const endpoint3 = client.Endpoint(path3);
        app.use(endpoint3.handler(test3));

        // Test non-matching path.
        await supertest(app)
            .post(path3)
            .send("{}");
        expect(test1).not.toHaveBeenCalled();
        expect(test2).not.toHaveBeenCalled();
        expect(test3).toHaveBeenCalled();

        // Test non-matching method.
        await supertest(app)
            .post(path1)
            .send("{}");
        expect(test1).not.toHaveBeenCalled();
        expect(test2).toHaveBeenCalled();
    });

    it("should call handler with the parsed request payload", async () => {
        const path = "/path";
        const test = jest.fn(() => {});
        const payload = {test: true, arr: [0, ""]};
        const endpoint = client.Endpoint(path);
        app.use(endpoint.handler(test));

        await supertest(app)
            .post(path)
            .send(JSON.stringify(payload));
        expect(test.mock.calls[0][0]).toEqual(payload);
    });

    it("should respond with stringified response from handler", async () => {
        const path = "/path";
        const payload = {test: true, arr: [0, ""]};
        const endpoint = client.Endpoint(path);
        app.use(endpoint.handler(() => payload));

        const response = await supertest(app)
            .post(path)
            .send("{}");
        expect(response.header["content-type"]).toContain("application/json");
        expect(response.body).toEqual(payload);
    });

    it("should respond with stringified response from handler", async () => {
        const path = "/path";
        const payload = {test: true, arr: [0, ""]};
        const endpoint = client.Endpoint(path);
        app.use(endpoint.handler(() => payload));

        const response = await supertest(app)
            .post(path)
            .send("{}");
        expect(response.body).toEqual(payload);
    });

    it("should defer errors to express", async () => {
        const path = "/path";
        const test = jest.fn();
        const error = new Error("test");
        const endpoint = client.Endpoint(path);
        app.use(
            endpoint.handler(() => {
                throw error;
            }),
        );
        app.use((err: any, _0: any, res: any, _1: any) => {
            test(err);
            res.sendStatus(200);
            return;
        });

        await supertest(app)
            .post(path)
            .send("{}");
        expect(test.mock.calls[0][0].toString()).toMatch(error.toString());
    });
});

describe("link.express", () => {
    let app: express.Express;
    let client: Client;
    let endpoint: Endpoint<any, any>;

    beforeEach(() => {
        app = express();
        client = new Client();
        client.use(link.express(app));
        endpoint = client.Endpoint("/" + Math.random());
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

        const sender: Link = async (request) => {
            request.headers[headerName] = headerValue;
            return link.express(app)(request);
        };
        client.use(sender);

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
});

describe("Client.unlink", () => {
    (window as any).fetch = () => null;

    it("should revert to default implementation", async () => {
        const client = new Client();
        const fetch = jest.spyOn(window, "fetch");
        const app = express();
        const endpoint = client.Endpoint("/test");

        fetch.mockReturnValue({
            status: 200,
            text: () => "{}",
        });
        app.use(endpoint.handler(() => "{}"));
        client.use(link.express(app));

        await endpoint.call({});
        expect(fetch).not.toHaveBeenCalled();

        client.unlink();
        await endpoint.call({});
        expect(fetch).toHaveBeenCalled();
    });
});
