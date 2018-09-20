import express from "express";

// prettier-ignore
export type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
// prettier-ignore
export type Status = 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 305 |  306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 |  422 | 423 | 424 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

export interface Config {
    method?: Method;
    host?: string;
    port?: number;
    path: string;
    expect?: Status | Status[];
}

interface StrictConfig {
    method: Method;
    host: string;
    port: number;
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

    let rawResponseData: string = "";
    try {
        const requestData = JSON.parse(rawRequestData);
        const responseData = await handler(requestData, req, res);
        rawResponseData = JSON.stringify(responseData);
    } catch (e) {
        return next(e);
    }

    if (!res.headersSent) {
        res.status(200);
        res.send(rawResponseData);
    }
    return next();
};

const request = async (config: StrictConfig, data: any) => {
    if (typeof window === "undefined") {
        const sneakyRequire = eval("require");
        const http = sneakyRequire("http");

        return new Promise((resolve, reject) => {
            const req = http.request(config, (res: any) => {
                let data = "";
                res.on("data", (chunk: string) => (data += chunk));
                res.on("end", () => {
                    if (config.expect.indexOf(res.statusCode as any) < 0) {
                        reject(Error("Unexpected status"));
                    }
                    resolve(JSON.parse(data));
                });
            });

            req.write(JSON.stringify(data));
            req.end();
        });
    }

    return new Promise((resolve, reject) => {
        const url = `${config.host}:${config.port}${config.path}`;
        const http = new XMLHttpRequest();

        http.open(config.method, url, true);
        http.onreadystatechange = () => {
            if (http.readyState !== 4) {
                return;
            }
            if (config.expect.indexOf(http.status as any) < 0) {
                reject(Error("Unexpected status"));
            }
            resolve(JSON.parse(http.responseText));
        };

        http.send(JSON.stringify(data));
    });
};

const hammond = <RQ, RS>(pathOrConfig: Config | string): Endpoint<RQ, RS> => {
    if (typeof pathOrConfig === "string") {
        pathOrConfig = {path: pathOrConfig};
    }

    const config: StrictConfig = {
        path: pathOrConfig.path,
        host: pathOrConfig.host || "",
        port: pathOrConfig.port || 80,
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
