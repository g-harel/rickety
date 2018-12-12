// prettier-ignore
type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";

// prettier-ignore
type Status = 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 305 |  306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 |  422 | 423 | 424 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

// Config object influences the behavior of both the
// request making and handling logic. It is designed to
// make it possible to represent an arbitrary endpoint
// that is not necessarily managed by this package.
interface Config {
    // HTTP method used when handling and making requests.
    // Defaults to "POST" if not configured.
    method?: Method;

    // The base should contain everything in the url before
    // the path. Default value of "" will send requests to the
    // same domain.
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

type LooseConfig = Config | string;

// A stricter version of the Config which demands defined values.
interface StrictConfig {
    method: Method;
    base: string;
    path: string;
    expect: Status[];
}

// Headers passed when invoking an endpoint.
interface LinkHeaders {
    [name: string]: string;
}

interface LinkRequest {
    method: string;
    url: string;
    headers: LinkHeaders;
    body: string;
}

interface LinkResponse {
    status: Status;
    body: string;
}

interface Link {
    (request: LinkRequest): Promise<LinkResponse>;
}

interface Callable<RQ, RS> {
    call(requestData: RQ): Promise<RS>;
}
