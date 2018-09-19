import "isomorphic-fetch";
import express from "express";

// prettier-ignore
export type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
// prettier-ignore
export type Status = 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 305 |  306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 |  422 | 423 | 424 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

export interface Config {
    method?: Method;
    host?: string;
    path: string;
    expect?: Status | Status[];
}

interface StrictConfig {
    method: Method;
    host: string;
    path: string;
    expect: Status[];
}

export interface RequestHandler<RQ, RS> {
    (data: RQ, req: express.Request, res: express.Response): RS | Promise<RS>;
}

export interface Endpoint<RQ, RS> {
    config: StrictConfig;
    (handler: RequestHandler<RQ, RS>): express.RequestHandler;
    (data: RQ): Promise<RS>;
}

const respond = (
    config: StrictConfig,
    handler: RequestHandler<any, any>,
): express.RequestHandler => async (req, res, next) => {
    if (req.path !== config.path) {
        return next();
    }
    if (req.method !== config.method) {
        return next();
    }
    if (res.headersSent) {
        return next();
    }

    const rawRequestData = await new Promise<string>((resolve) => {
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
    });

    const requestData = JSON.parse(rawRequestData);
    const responseData = await handler(requestData, req, res);
    const rawResponseData = JSON.stringify(responseData);

    if (!res.headersSent) {
        res.status(200);
        res.send(rawResponseData);
    }
    next();
};

const request = async (config: StrictConfig, data: any) => {
    const response = await fetch(config.host + config.path, {
        method: config.method,
        body: JSON.stringify(data),
    });

    if (config.expect.indexOf(response.status as any) < 0) {
        throw new Error("Unexpected status");
    }

    return response.json();
};

const hammond = <RQ, RS>(pathOrConfig: Config | string): Endpoint<RQ, RS> => {
    if (typeof pathOrConfig === "string") {
        pathOrConfig = {path: pathOrConfig};
    }

    const config: StrictConfig = {
        path: pathOrConfig.path,
        host: pathOrConfig.host || "",
        method: pathOrConfig.method || "POST",
        expect: [].concat(pathOrConfig.expect || (200 as any)) as Status[],
    };

    const callable = (dataOrHandler: any): any => {
        if (typeof dataOrHandler === "function") {
            return respond(config, dataOrHandler);
        }
        return request(config, dataOrHandler);
    };

    return Object.assign(callable, {config});
};

export default hammond;
