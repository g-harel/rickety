import express from "express";

export {Sender, SenderRequest, SenderResponse} from "./request";

import {browserSender, Sender, serverSender} from "./request";
import {respond} from "./respond";

// prettier-ignore
export type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";

// prettier-ignore
export type Status = 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 305 |  306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 |  422 | 423 | 424 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

// Config object influences the behavior of both the
// request making and handling logic. It is designed to
// make it possible to represent an arbitrary endpoint
// that is not necessarily managed by this package.
export interface Config {
    // HTTP method used when handling and making requests.
    // Defaults to "POST" if not configured.
    method?: Method;

    // The base should contain everything in the url before
    // the path. Default value of "" will send requests to the
    // same domain on a webpage or will fail when calling
    // endpoints in the node environment.
    base?: string;

    // URL path at which the handler will be registered and
    // the requests will be sent. This setting is required.
    path: string;

    // Expected returned status code(s). By default, anything
    // but a "200" is considered an error. This value is only
    // used for making requests and has no influence on the
    // handler which will also return "200" by default.
    expect?: Status | Status[];
}

// Headers passed when invoking an endpoint.
export interface Headers {
    [name: string]: string;
}

// A stricter version of the Config which demands defined values.
export interface StrictConfig {
    method: Method;
    base: string;
    path: string;
    expect: Status[];
}

// Request handlers contain the server code that transforms
// typed requests into typed responses. Both express' request
// and response objects are passed to the function to make it
// possible to implement custom behavior like accessing and
// writing headers when necessary.
export interface RequestHandler<RQ, RS> {
    (data: RQ, req: express.Request, res: express.Response): Promise<RS> | RS;
}

// An endpoint contains its configuration as well as the types
// of the request and response values.
export class Endpoint<RQ, RS> {
    // Sender value is platform dependent. An implementation
    // for both browser and node globals is included.
    public static sender: Sender =
        typeof window === "undefined" ? serverSender : browserSender;

    public readonly config: StrictConfig;

    constructor(pathOrConfig: Config | string) {
        // After this block, the input argument can only have
        // the type of a Config.
        if (typeof pathOrConfig === "string") {
            pathOrConfig = {path: pathOrConfig};
        }

        this.config = {
            path: pathOrConfig.path,
            base: pathOrConfig.base || "",
            method: pathOrConfig.method || "POST",
            // The expected status is normalized into an array.
            expect: [].concat(pathOrConfig.expect || (200 as any)) as Status[],
        };
    }

    // The call function sends requests to the configured
    // endpoint using the configured sender function.
    // It returns a promise which may throw errors if there
    // is an issue with the request process or if the status
    // is unexpected.
    public async call(data: RQ, ...h: Headers[]): Promise<RS> {
        const url = `${this.config.base}${this.config.path}`;
        const body = JSON.stringify(data);
        const method = this.config.method;
        const headers: Headers = Object.assign({}, ...h);

        const res = await Endpoint.sender({method, url, body, headers});

        if (this.config.expect.indexOf(res.status as any) < 0) {
            let message = res.body;
            if (message.length > 64) {
                message = message.substr(0, 64) + "...";
            }
            throw new Error(`Unexpected status: ${res.status} ${message}`);
        }

        return JSON.parse(res.body);
    }

    public handler(handler: RequestHandler<RQ, RS>): express.RequestHandler {
        return respond(this.config, handler);
    }
}
