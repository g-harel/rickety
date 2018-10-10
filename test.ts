import express from "express";
import supertest from "supertest";

import {Config, Endpoint, SenderRequest, SenderResponse, Sender} from ".";

describe("Endpoint", () => {
    it("should accept a path in the constructor", () => {
        const path = "/api/test";
        const e = new Endpoint(path);
        expect(e.config.path).toBe(path);
    });

    it("should accept a config in the constructor", () => {
        const config: Config = {
            base: "base",
            expect: [200],
            method: "POST",
            path: "/path",
        };
        const e = new Endpoint(config);
        expect(e.config).toMatchObject(config);
    });

    describe("call", () => {
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

    describe("handler", () => {
        let app: express.Express;

        // The app is replaced with a fresh instance before each test.
        beforeEach(() => {
            app = express();
            Endpoint.sender = superSender(app);
        });

        it("should handle run when endpoint is called", async () => {
            const test = jest.fn(() => {});
            const endpoint = new Endpoint("/path123");
            app.use(endpoint.handler(test));
            await endpoint.call({});
            expect(test).toHaveBeenCalled();
        });
    });
});

// The test sender uses supertest to simulate request
// being sent to the app's handlers.
const superSender = (app: express.Express): Sender => async (request) => {
    const method = request.method.toLowerCase();
    let req: supertest.Test = (supertest(app) as any)[method](request.url);
    Object.keys(request.headers).forEach((name) => {
        req = req.set(name, request.headers[name]);
    });
    req.send(request.body)
    return new Promise<SenderResponse>((resolve, reject) => {
        req.end((err, response) => {
            if (err) reject(err);
            resolve({
                status: response.status as any,
                body: JSON.stringify(response.body),
            })
        });
    });
}
