# 4.0.0

Remove headers argument from Endpoint.call.

```typescript
// TODO show how to use middleware instead
```

##

Make Endpoints configurable with a Client (instead of globally).


```typescript
// TODO show how to Client.use instead of link
```

##

Add construct to group endpoints into a single callable entity.

```typescript
// TODO show basic group usage
```

##

Move `base` config option into the client.

```typescript
// TODO show before/after
// TODO express router for handling client base
```

##

Make `status` and `method` config options primitive types.

```typescript
// TODO show before/after
```

##

Make request and response types available on endpoints.

```typescript
// TODO sample
```

##

Move links into own directory.

```typescript
// TODO show before/after
```

##

Removed noisy exports from default entry.

```typescript
// TODO sample of looking into ./link and ./source/endpoint
```

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
