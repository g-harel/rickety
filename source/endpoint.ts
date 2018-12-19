import {Request, Response} from "express";

import {Client} from "..";
import {ClientResponse} from "./client";
import {Callable} from "./callable";

// Config object influences the behavior of both the
// request making and handling logic. It is designed to
// make it possible to represent an arbitrary endpoint
// that is not necessarily managed by this package.
export interface Config {
    // Client is used to send the requests and can be shared
    // by multiple endpoints.
    client: Client;

    // HTTP method used when handling and making requests.
    // Defaults to "POST" if not configured.
    method?: string;

    // URL path at which the handler will be registered and
    // the requests will be sent. This setting is required.
    path: string;

    // Expected returned status code(s). By default, anything
    // but a `200` is considered an error. This value is only
    // used for making requests and has no influence on the
    // handler (which will return `200` by default).
    expect?: number | number[];

    // Type checking function run before and after
    // serializing requests in both client and server.
    isRequest?: (req: any) => boolean;

    // Type checking function run before and after
    // serializing responses in both client and server.
    isResponse?: (res: any) => boolean;
}

// Request handlers contain the server code that transforms
// typed requests into typed responses. Both express' request
// and response objects are passed to the function to make it
// possible to implement custom behavior like accessing and
// writing headers when necessary.
export interface Handler<RQ, RS> {
    (data: RQ, req: Request, res: Response): Promise<RS> | RS;
}

// Helper to create formatted errors with added information
// about the endpoint instance.
export const err = (endpoint: Endpoint<any, any>, ...messages: any[]): Error => {
    const {method, path} = endpoint;
    messages.unshift(`EndpointError (${method} ${path})`);
    messages = messages.map((message, i) => {
        return " ".repeat(i) + message.toString();
    });
    const e = new Error(messages.join("\n"));
    return e;
};

// An endpoint contains its configuration as well as the types
// of the request and response values.
export class Endpoint<RQ, RS> extends Callable<RQ, RS> implements Config {
    public readonly client: Client;
    public readonly method: string;
    public readonly path: string;
    public readonly expect: number[];
    public readonly isRequest: (req: any) => boolean;
    public readonly isResponse: (res: any) => boolean;

    constructor(config: Config) {
        super();
        this.client = config.client;
        this.method = config.method || "POST";
        this.path = config.path;
        this.expect = [].concat((config.expect as any) || 200);
        this.isRequest = config.isRequest || ((() => true) as any);
        this.isResponse = config.isResponse || ((() => true) as any);
    }

    // The call function sends requests to the configured
    // endpoint using the configured sender function.
    // It returns a promise which may throw errors if there
    // is an issue with the request process or if the status
    // is unexpected.
    public async call(requestData: RQ): Promise<RS> {
        if (!this.isRequest(requestData)) {
            throw err(this, "Request type check failed", requestData);
        }

        let body: string;
        try {
            body = JSON.stringify(requestData);
        } catch (e) {
            throw err(this, "Could not stringify request data", e);
        }

        const url = this.path;
        const method = this.method;
        const headers = {
            "Content-Type": "application/json",
        };

        let res: ClientResponse;
        try {
            res = await this.client.send({method, url, body, headers});
        } catch (e) {
            throw err(this, "Request sending failed", e);
        }
        if ((this.expect as any).indexOf(res.status as any) < 0) {
            throw err(this, `Unexpected status: ${res.status}`, res.body);
        }

        let responseData: RS;
        try {
            responseData = JSON.parse(res.body);
        } catch (e) {
            throw err(this, "Could not parse response data", e, res.body);
        }

        if (!this.isResponse(responseData)) {
            throw err(this, "Response type check failed", responseData);
        }

        return responseData;
    }

    // Handler generator returning an express request handler
    // from a config and a request handling function.
    public handler(handler: Handler<RQ, RS>): any {
        return async (req: Request, res: Response, next: (err?: any) => void) => {
            // Only requests with the correct method are handled.
            if (req.method !== this.method) {
                return next();
            }

            // Requests with the correct full path are handled.
            // If the endpoint's base path is also defined,
            // requests with the correct base and path part
            // are also handled.
            if (req.originalUrl !== this.path) {
                return next();
            }

            // Handler is not invoked if a different handler
            // has already answered the request. This situation
            // is considered an error since the handler should
            // have been used.
            if (res.headersSent) {
                return next(err(this, "Response has already been sent."));
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
                return next(err(this, msg, e, rawRequestData));
            }

            if (!this.isRequest(requestData)) {
                return next(err(this, "Request type check failed", requestData));
            }

            let responseData: RS;
            try {
                responseData = await handler(requestData, req, res);
            } catch (e) {
                return next(err(this, "Handler error", e));
            }

            if (!this.isResponse(responseData)) {
                return next(err(this, "Response type check failed", responseData));
            }

            // Although the handler is given access to the express
            // response object, it should not send the data itself.
            if (res.headersSent) {
                return next(err(this, "Response was sent by handler."));
            }

            let rawResponseData: string = "";
            try {
                rawResponseData = JSON.stringify(responseData);
            } catch (e) {
                return err(this, "Could not stringify response data", e);
            }

            res.status(200);
            res.set("Content-Type", "application/json");
            res.send(rawResponseData);
        };
    }
}
