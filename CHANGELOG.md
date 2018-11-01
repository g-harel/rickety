# 3.0.3

##

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
