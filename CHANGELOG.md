# 4.0.0

Make Endpoints require a client in their configuration.

Multiple clients are implemented for different use cases in [`client/...`](./client). A default client is also exported from the package (currently [`FetchClient`](./client/fetch.ts)).

The only requirement for a client is that it satisfies the `Client` interface available in [`rickety/client`](./client/index.ts).

```typescript
const endpoint = new Endpoint({
    client: myAPI,
    // ...
});
```

##

Remove headers arguments from `Endpoint.call`. Headers can still be modified using a custom client.

```typescript
class CustomClient extends DefaultClient implements Client {
    public send(request: ClientRequest) {
        request.headers["Custom-Header"] = "abc";
        return super.send(request);
    }
}

const myAPI = new CustomClient();

const endpoint = new Endpoint({
    client: myAPI,
    // ...
});
```

##

Remove `base` option from endpoint configuration. The url can still be modified using a custom client.

```typescript
class CustomClient extends DefaultClient implements Client {
    public send(request: ClientRequest) {
        request.url = "https://example.com/base/" + request.url
        return super.send(request);
    }
}

const myAPI = new CustomClient();

const endpoint = new Endpoint({
    client: myAPI,
    // ...
});
```

##

Removed exports from entry module. Internal types are still exported, but from other files. For example, endpoint `Config` can be accessed from "rickety/source/endpoint" and `Client` from "rickety/client".

The custom types for `Status` and `Method` were also removed in favor of `number` and `string` respectively.

##

Make JSON marshalling/un-marshalling more lenient for raw strings. This issue comes up if a server is returning a plain message `str`. Since it is not valid JSON it cannot be parsed without extra steps. The correct format for a JSON string surrounds it with double quotes `"str"`.

This behavior can be disabled by enabling `strict` mode in an endpoint's config.

```typescript
const endpoint = new Endpoint({
    // ...
    strict: true,
});
```

##

Add `Group` construct to combine endpoints into single callable entity. Requests and responses remain strictly typed and have the same "shape" as the group's template.

```typescript
const endpoint = new Endpoint<string, number>( ... );

const group = new Group({
    very: {
        nested: {
            example: endpoint,
        },
    },
});

const response = await group.call({
    very: {
        nested: {
            example: "abc",
        },
    },
})

// response {
//     very: {
//         nested: {
//             example: 123,
//         }
//     }
// }
```

##

Add optional type checking options to endpoint config. These are used both when marshalling and un-marshalling data.

```typescript
const endpoint = new Endpoint({
    // ...
    isRequest: (req) => {
        if (!req) return false;
        if (req.value === undefined) return false;
        return true;
    },
    isResponse: (res) => {
        // ...
    },
});
```

##

Make endpoint (and group) request and response types available as `$req` and `$res`.

```typescript
const endpointRequest: typeof endpoint.$req;
const groupResponse: typeof group.$res;
```

_Using these members by value with produce an error._

# 3.0.3

Make handler path comparing use `req.originalUrl` instead of `req.path`.

```typescript
// v3.0.2 match with "/api/api/test"
// v3.0.3 match with "/api/test"
app.use("/api", endpoint.handler( ... ));
```

##

Make requests where `req.base` equals endpoint's base and `req.path` equals endpoint's path match with handler. This change is primarily meant to preserve the possibility of using a base in both the endpoint and express.

```typescript
const endpoint = new Endpoint({
    base: "/api",
    path: "/test",
});

// v3.0.2 match with "/api/test" and "/api2/test"
// v3.0.3 match with "/api/test"
app.use("/api(2?)", endpoint.handler( ... ));
```
