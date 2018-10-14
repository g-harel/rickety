<!--

TODO
- config allowing data transfer through get params (URL encode) (sending nested object in query params is ??? but receiving should work)
- make errors more helpful / clear
- make sender not a global, but remain mockable for tests (can't use mocks if app code replaces sender)
- design a complete testing story (ex. calling handlers without the network)
- allow sync runtime type checks (isRequest, isResponse)

CHANGELOG
- properly set content-type headers
- make endpoint config private
- remove support for node `call` cause fetch + https

 -->

# rickety [![](https://img.shields.io/npm/v/rickety.svg)](https://www.npmjs.com/package/rickety) [![](https://img.shields.io/npm/types/rickety.svg)](https://github.com/g-harel/rickety)

> minimal typescript rpc framework

* Simple package interface
* Configurable endpoint definitions
* No runtime dependencies

## Install

```shell
$ npm install rickety
```

## Usage

``` typescript
import {Endpoint} from "rickety";
```

```typescript
type Request = {...}
type Response = {...}

const endpoint = new Endpoint<Request, Response>("/api/...");
```

```typescript
app.use(
    endpoint.handler(async (request) => {
        return response;
    });
);
```

```typescript
const response = await endpoint.call(request);
```

## API

```typescript
export type Method // HTTP Method (GET, POST, ...)
export type Status // HTTP Status (200, 404, 500, ...)

export interface Config {
    method?: Method;             // "POST"
    base?: string;               // ""
    path: string;
    expect?: Status | Status[];  // 200
}

export interface Headers {
    [name: string]: string;
}

export interface RequestHandler<RQ, RS> {
    (data: RQ, req: express.Request, res: express.Response): Promise<RS> | RS;
}

export class Endpoint<RQ, RS> {
    static sender: Sender;

    constructor(config: Config);
    constructor(path: string);

    call(data: RQ, ...headers: Headers[]): Promise<RS>;
    handler(handler: RequestHandler<RQ, RS>): express.RequestHandler;
}
```

### Advanced

The request sender can be replaced to modify the implementation or mock the network during tests.

```typescript
Endpoint.sender = customSenderImplementation;
```

```typescript
export interface SenderRequest {
    method: string;
    url: string;
    headers: Headers;
    body: string;
}

export interface SenderResponse {
    status: Status;
    body: string;
}

export interface Sender {
    (request: SenderRequest): Promise<SenderResponse>;
}
```

## License

[MIT](./LICENSE)
