# [H]ts

> minimal typescript rpc framework

* No runtime dependencies
* Highly configurable endpoint definitions
* Simple package interface
* Supports endpoint invocation from Node

## Install

```shell
$ npm install hts
```

## Usage

```typescript
type Request = {...}
type Response = {...}

const endpoint = H<Request, Response>("/api/v1/...");
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
