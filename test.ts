import express from "express";

import {Config, Endpoint, SenderRequest} from ".";
import {sender} from "./supertest";

describe("Endpoint.call", () => {
    let sender: jest.Mock;
    let lastSent: SenderRequest;

    // Endpoint sender is replaced with a fresh mock before each test.
    beforeEach(() => {
        sender = jest.fn((request) => {
            lastSent = request;
            return {status: 200, body: "{}"};
        });
        Endpoint.sender = sender;
    });

    it("should concatenate the base and the path to form the url", async () => {
        const config: Config = {
            base: "base123",
            path: "/path123",
        };
        await new Endpoint(config).call({});
        expect(lastSent.url).toBe(config.base + config.path);
    });

    it("should pass along request data to sender", async () => {
        const path = "/path123";
        const request = {
            test: true,
            list: [0, "test", null],
        };
        await new Endpoint(path).call(request);
        expect(lastSent.body).toBe(JSON.stringify(request));
    });

    it("should use the configured http method", async () => {
        const config: Config = {
            method: "HEAD",
            path: "/path123",
        };
        await new Endpoint(config).call({});
        expect(lastSent.method).toBe(config.method);
    });

    it("should collapse headers together", async () => {
        const headers: Array<Record<string, string>> = [
            {testA: "test"},
            {testB: "test"},
        ];
        await new Endpoint("/test").call({}, ...headers);
        for (let headerSubset of headers) {
            expect(lastSent.headers).toMatchObject(headerSubset);
        }
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
        const endpoint = new Endpoint(config);
        await expect(endpoint.call({})).rejects.toThrow(/status.*400/);
    });

    it("should truncate the request body in the error message when the status is unexpected", async () => {
        const message = Array(1000).join("-");
        const config: Config = {
            path: "/test",
            expect: 201,
        };
        sender.mockReturnValueOnce({
            status: 200,
            body: message,
        });
        const endpoint = new Endpoint(config);
        await expect(endpoint.call({})).rejects.toThrow(/^.{0,200}\.\.\.$/);
    });
});

describe("Endpoint.handler", () => {
    let app: express.Express;

    // The app is replaced with a fresh instance before each test.
    beforeEach(() => {
        app = express();
        Endpoint.sender = sender(app);
    });

    it("should run handler when endpoint is called", async () => {
        const test = jest.fn(() => {});
        const endpoint = new Endpoint("/path123");
        app.use(endpoint.handler(test));
        await endpoint.call({});
        expect(test).toHaveBeenCalled();
    });

    it("should not run handler when other endpoint is called", async () => {
        const test1 = jest.fn(() => {});
        const endpoint1 = new Endpoint({
            method: "PUT",
            path: "/path1",
        });
        app.use(endpoint1.handler(test1));

        const test2 = jest.fn(() => {});
        const endpoint2 = new Endpoint("/path1");
        app.use(endpoint2.handler(test2));

        const test3 = jest.fn(() => {});
        const endpoint3 = new Endpoint("/path3");
        app.use(endpoint3.handler(test3));

        // Test non-matching path.
        await endpoint3.call({});
        expect(test1).not.toHaveBeenCalled();
        expect(test2).not.toHaveBeenCalled();
        expect(test3).toHaveBeenCalled();

        // Test non-matching method.
        await endpoint2.call({});
        expect(test2).toHaveBeenCalled();
        expect(test1).not.toHaveBeenCalled();
    });

    it("should receive the parsed request payload", async () => {
        const test = jest.fn(() => {});
        const payload = {test: true, arr: [0, ""]};
        const endpoint = new Endpoint("/path");
        app.use(endpoint.handler(test));
        await endpoint.call(payload);
        expect(test.mock.calls[0][0]).toEqual(payload);
    });

    it("should transmit response to client call", async () => {
        const payload = {test: true, arr: [0, ""]};
        const endpoint = new Endpoint("/path");
        app.use(endpoint.handler(() => payload));
        const response = await endpoint.call({a: 0});
        expect(response).toEqual(payload);
    });

    it("should use the built-in express error handling", async () => {
        const test = jest.fn();
        const error = new Error("test");
        const endpoint = new Endpoint("/path");
        app.use(endpoint.handler(() => {
            throw error;
        }));
        app.use((err: any, _0: any, res: any, _1: any) => {
            test(err);
            res.sendStatus(200);
            return;
        });
        await endpoint.call({});
        expect(test).toHaveBeenCalledWith(error);
    });
});
