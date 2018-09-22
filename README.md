# rickety

> minimal typescript rpc framework

* Simple package interface
* Highly configurable endpoint definitions
* No runtime dependencies
* Supports endpoint invocation from Node

## Install

```shell
$ npm install rickety
```

## Usage

``` typescript
import {def} from "rickety";
```

```typescript
type Request = {...}
type Response = {...}

const endpoint = def<Request, Response>("/api/v1/...");
```

```typescript
app.use(
    endpoint(async (request) => {
        return response;
    });
);
```

```typescript
const response = await endpoint(request);
```

## License

[MIT](./LICENSE)
