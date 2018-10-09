import {Config, Endpoint, SenderRequest} from ".";

let sender: jest.Mock;
let lastSent: SenderRequest;

describe("Endpoint", () => {
    beforeEach(() => {
        sender = jest.fn((request) => {
            lastSent = request;
            return {status: 200, body: "{}"};
        });
        Endpoint.sender = sender;
    });

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
            const endpoint = await new Endpoint(config);
            expect(endpoint.call({})).rejects.toThrow(/status.*400/);
        });
    });
});
