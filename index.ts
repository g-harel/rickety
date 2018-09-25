import express from "express";

import {request} from "./request";
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

    // URL used when making requests. Default value of ""
    // will send requests to the same domain on a webpage
    // or to localhost when run in the node environment.
    host?: string;

    // Port used when making requests, but with no effect
    // on request handling. Default value of "80".
    port?: number;

    // URL path at which the handler will be registered and
    // the requests will be sent. This setting is required.
    path: string;

    // Expected returned status code(s). By default, anything
    // but a "200" is considered an error. This value is only
    // used for making requests and has no influence on the
    // handler which will also return "200" by default.
    expect?: Status | Status[];
}

// Headers can be passed when invoking the endpoint.
export interface Headers {
    [name: string]: string;
}

// A stricter version of the Config which demands defined values.
export interface StrictConfig {
    method: Method;
    host: string;
    port: number;
    path: string;
    expect: Status[];
}

// Request handlers contain the server code that transforms
// typed requests into typed responses. Both express' request
// and response objects are passed to the function to make it
// possible to implement custom behavior like accessing and
// writing headers when necessary.
export interface RequestHandler<RQ, RS> {
    (data: RQ, req: express.Request, res: express.Response): RS | Promise<RS>;
}

// An endpoint contains its configuration as well as the types
// of the request and response values.
export class Endpoint<RQ, RS> {
    public readonly config: StrictConfig;

    constructor(pathOrConfig: Config | string) {
        // After this block, the input argument can only have the
        // type of a Config.
        if (typeof pathOrConfig === "string") {
            pathOrConfig = {path: pathOrConfig};
        }

        this.config = {
            path: pathOrConfig.path,
            host: pathOrConfig.host || "",
            port: pathOrConfig.port || 80,
            method: pathOrConfig.method || "POST",
            // The expected status is normalized into an array.
            expect: [].concat(pathOrConfig.expect || (200 as any)) as Status[],
        };
    }

    public async call(data: RQ, ...headers: Headers[]): Promise<RS> {
        return request(this.config, data, headers);
    }

    public handler(handler: RequestHandler<RQ, RS>): express.RequestHandler {
        return respond(this.config, handler);
    }
}
