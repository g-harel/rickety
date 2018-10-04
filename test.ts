import {Config, Endpoint} from ".";

let sender: jest.Mock;

describe("Endpoint", () => {
    beforeEach(() => {
        sender = jest.fn(() => ({status: 200, body: "{}"}));
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
        it("should pass along request data to sender", async () => {
            const path = "/path123";
            const request = {
                test: true,
                list: [0, "test", null],
            };
            await new Endpoint(path).call(request);
            expect(sender).toHaveBeenCalledWith({
                body: JSON.stringify(request),
                headers: {},
                method: "POST",
                url: path,
            });
        });

        it("should concatenate the base and the path to form the url", async () => {
            const config: Config = {
                base: "base123",
                path: "/path123",
            };
            await new Endpoint(config).call({});
            expect(sender).toHaveBeenCalledWith({
                body: "{}",
                headers: {},
                method: "POST",
                url: config.base + config.path,
            });
        });

        it("should use the configured http method", async () => {
            const config: Config = {
                method: "HEAD",
                path: "/path123",
            };
            await new Endpoint(config).call({});
            expect(sender).toHaveBeenCalledWith({
                body: "{}",
                headers: {},
                method: config.method,
                url: config.path,
            });
        });
    });
});
