import {Request, Response} from "express";

// Request handlers contain the server code that transforms
// typed requests into typed responses. Both express' request
// and response objects are passed to the function to make it
// possible to implement custom behavior like accessing and
// writing headers when necessary.
export interface RequestHandler<RQ, RS> {
    (data: RQ, req: Request, res: Response): Promise<RS> | RS;
}

const resolveConfig = (config: LooseConfig): StrictConfig => {
    // After this block, the input argument can only have
    // the type of a Config.
    if (typeof config === "string") {
        config = {path: config};
    }

    return {
        path: config.path || "/",
        base: config.base || "",
        method: config.method || "POST",
        // The expected status is normalized into an array.
        expect: [].concat(config.expect || (200 as any)) as Status[],
    };
};

// Helper to create formatted errors with added information
// about the endpoint instance.
const err = (config: StrictConfig, ...messages: any[]) => {
    const {method, base, path} = config;
    messages.unshift(`EndpointError (${method} ${base}${path})`);
    messages = messages.map((message, i) => {
        return " ".repeat(i) + message.toString();
    });
    const e = new Error(messages.join("\n"));
    return e;
};

const defaultLink: Link = async (request) => {
    const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        credentials: "same-origin",
    });

    const body = await response.text();
    const status = response.status as Status;
    return {body, status};
};

export class Client {
    // Link is invoked with an object representing an http
    // request. Its only responsibility is to return a similarly
    // structured response object.
    private link: Link = defaultLink;

    public use = (link: Link): Client => {
        this.link = link;
        return this;
    };

    public unlink = (): Client => {
        this.link = defaultLink;
        return this;
    };

    public getLink = (): Link => {
        return this.link;
    };

    public Endpoint = <RQ, RS>(config: LooseConfig): Endpoint<RQ, RS> => {
        return new Endpoint(this, config);
    };
}

// An endpoint contains its configuration as well as the types
// of the request and response values.
export class Endpoint<RQ, RS> implements Callable<RQ, RS> {
    private config: StrictConfig;
    private client: Client;

    constructor(client: Client, config: LooseConfig) {
        this.client = client;
        this.config = resolveConfig(config);
    }

    // The call function sends requests to the configured
    // endpoint using the configured sender function.
    // It returns a promise which may throw errors if there
    // is an issue with the request process or if the status
    // is unexpected.
    public async call(requestData: RQ): Promise<RS> {
        let body: string;
        try {
            body = JSON.stringify(requestData);
        } catch (e) {
            throw err(this.config, "Could not stringify request data", e);
        }

        const url = `${this.config.base}${this.config.path}`;
        const method = this.config.method;
        const headers: LinkHeaders = {
            "Content-Type": "application/json",
        };

        let res: LinkResponse;
        try {
            res = await this.client.getLink()({method, url, body, headers});
        } catch (e) {
            throw err(this.config, "Request sending failed", e);
        }
        if ((this.config.expect as any).indexOf(res.status as any) < 0) {
            throw err(this.config, `Unexpected status: ${res.status}`, res.body);
        }

        let responseData: RS;
        try {
            responseData = JSON.parse(res.body);
        } catch (e) {
            throw err(this.config, "Could not parse response data", e, res.body);
        }
        return responseData;
    }

    // Handler generator returning an express request handler
    // from a config and a request handling function.
    public handler(handler: RequestHandler<RQ, RS>): any {
        return async (req: Request, res: Response, next: (err?: any) => void) => {
            // Only requests with the correct method are handled.
            if (req.method !== this.config.method) {
                return next();
            }

            // Requests with the correct full path are handled.
            // If the endpoint's base path is also defined,
            // requests with the correct base and path part
            // are also handled.
            if (req.originalUrl !== this.config.path) {
                const baseMatch = req.baseUrl === this.config.base;
                const pathPartMatch = req.path === this.config.path;
                if (!baseMatch || !pathPartMatch) {
                    return next();
                }
            }

            // Handler is not invoked if a different handler
            // has already answered the request. This situation
            // is considered an error since the handler should
            // have been used.
            if (res.headersSent) {
                return next(err(this.config, "Response has already been sent."));
            }

            // Request body is streamed into a string to be parsed.
            const rawRequestData = await new Promise<string>((resolve) => {
                let data = "";
                req.setEncoding("utf8");
                req.on("data", (chunk) => (data += chunk));
                req.on("end", () => resolve(data));
            });

            let requestData: RQ;
            try {
                requestData = JSON.parse(rawRequestData);
            } catch (e) {
                const msg = "Could not parse request data";
                return next(err(this.config, msg, e, rawRequestData));
            }

            let responseData: RS;
            try {
                responseData = await handler(requestData, req, res);
            } catch (e) {
                return next(err(this.config, "Handler error", e));
            }

            // Although the handler is given access to the express
            // response object, it should not send the data itself.
            if (res.headersSent) {
                return next(err(this.config, "Response was sent by handler."));
            }

            let rawResponseData: string = "";
            try {
                rawResponseData = JSON.stringify(responseData);
            } catch (e) {
                return err(this.config, "Could not stringify response data", e);
            }

            res.status(200);
            res.set("Content-Type", "application/json");
            res.send(rawResponseData);
        };
    }
}
