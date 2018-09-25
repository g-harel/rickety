# rickety

> minimal typescript rpc framework

* Simple package interface
* Configurable endpoint definitions
* No runtime dependencies
* Supports endpoint invocation from NodeJS

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

## License

[MIT](./LICENSE)
