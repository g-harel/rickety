import express from "express";

// prettier-ignore
type httpVerb = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
// prettier-ignore
type statusCode = 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

export interface Contract<T = any, S = any> {
    request: T;
    response: S;
}

interface EndpointConfig {
    verb: httpVerb;
    expectedStatusCode: statusCode[];
}

export class Endpoint<C extends Contract> {
    public readonly config: EndpointConfig;
    public readonly path: string;

    constructor(path: string, config?: EndpointConfig) {
        const defaultConfig: EndpointConfig = {
            verb: "POST",
            expectedStatusCode: [200],
        };
        this.config = Object.assign(defaultConfig, config);
        this.path = path;
    }

    public async call(req: C["request"]): Promise<C["response"]> {
        console.log(req);
        return {};
    }

    public register(
        app: express.Application,
        handler: (
            requestData: C["request"],
            req: express.Request,
            res: express.Response,
        ) => Promise<C["response"]>,
        errorHandler?: (err: any) => any,
    ): void {
        const verb = this.config.verb.toLowerCase();
        const test: express.IRouterMatcher<any> = (app as any)[verb] as any;

        test(this.path, async (req, res) => {
            if (res.headersSent) {
                return;
            }

            const rawRequestData = await new Promise<string>((resolve) => {
                let data = "";
                req.setEncoding("utf8");
                req.on("data", (chunk) => (data += chunk));
                req.on("end", () => resolve(data));
            });

            let requestData = null;
            try {
                requestData = JSON.parse(rawRequestData);
            } catch (e) {
                res.sendStatus(400);
                res.send("Could not parse incoming request data.");
                return;
            }

            let responseData = null;
            try {
                responseData = await handler(requestData, req, res);
            } catch (e) {
                res.sendStatus(500);
                res.send("Request handler error.");
                return;
            }

            let rawResponseData = "";
            try {
                rawResponseData = JSON.stringify(responseData);
            } catch (e) {
                res.sendStatus(500);
                res.send("Could not serialize outgoing response data.");
                return;
            }

            res.sendStatus(200);
            res.send(rawResponseData);
        });
    }
}
