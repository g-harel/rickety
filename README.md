<!--

TODO
- update readme/changelog for v4
- investigate bundling options (avoid async polyfill in each file)

 -->

# :scroll: rickety

[![](https://img.shields.io/npm/v/rickety.svg)](https://www.npmjs.com/package/rickety)
[![](https://travis-ci.org/g-harel/rickety.svg?branch=master)](https://travis-ci.org/g-harel/rickety)
[![](https://img.shields.io/npm/types/rickety.svg)](https://github.com/g-harel/rickety)

> minimal typescript rpc framework

* [Strongly typed endpoints](#usage)
* [Groupable queries](#group)
* [Simple interface](#api)
* [Convenient testing](#testing)
* [No runtime dependencies](/package.json)

##

[Try out the example project to experiment with a working setup (including tests)](/example)

## Install

```shell
$ npm install rickety
```

## Usage

``` typescript
import {DefaultClient, Endpoint} from "rickety";
```

```typescript
const myAPI = new DefaultClient();

const userByID = new Endpoint<number, User>({
    client: myAPI,
    path: "/api/v1/...",
});
```

```typescript
app.use(
    userByID.handler(async (id) => {
        // ...
        return user;
    });
);
```

```typescript
const user = await userByID.call(id);
```

## Endpoint

An endpoint's call function sends requests using the configured options. It returns a promise which may reject if there is an issue with the request process or if the status is unexpected.

```typescript
const response = await endpoint.call(request);
```

Request handlers contain the server code that transforms typed requests into typed responses. Both express' request and response objects are passed to the function to make it possible to implement custom behavior like accessing and writing headers when necessary.

```typescript
app.use(
    endpoint.handler(async (request, req, res) => {
        // ...
        return response;
    });
);
```

Endpoints expose their configuration through readonly public values which can be accessed from the instance. This allows visibility into the default values if the option was not defined on creation.

```typescript
const method = endpoint.method;
```

The endpoint's request and response types can also be accessed using `typeof` on two special members. Accessing these by value with produce an error.

```typescript
type Request = typeof endpoint.$req;
type Response = typeof endpoint.$res;
```

#### Config

```typescript
const endpoint = new Endpoint({
    client: Client;
    method?: string;
    path: string;
    expect?: number | number[];
    isRequest?: (req: any) => boolean;
    isResponse?: (res: any) => boolean;
    strict?: boolean;
});
```

| | |
| -- | -- |
| `client` | Client is used to send the requests and can be shared by multiple endpoints. More info [here](#client). |
| `method` | HTTP method used when handling and making requests. Defaults to `POST` if not configured. |
| `path` | Required URL path at which the handler will be registered and the requests will be sent. |
| `expect` | Expected returned status code(s). By default, anything but `200` is considered an error. This value is only used for making requests and has no influence on the handler (which will return `200` by default). |
| `isRequest` `isResponse` | Type checking functions run before and after serializing the objects in both client and server. By default any value will be considered correct. |
| `strict` | Flag to enable strict JSON marshalling/un-marshalling. By default "raw" strings are detected and handled as non-JSON. In strict mode, they would cause a parsing error. This issue is relevant if a server is returning a plain message `str`. Since it is not valid JSON it cannot be parsed without extra steps. The correct format for a JSON string surrounds it with double quotes `"str"`. |

## Client

Clients are responsible for sending requests and receiving responses.

Rickety is released with a few included clients which can be imported using the [`rickety/client/...`](./client) path pattern.

| [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) | [`xhr`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) | [`node`](https://nodejs.org/api/https.html) | [`request`](https://github.com/request/request) | [`axios`](https://github.com/axios/axios) |
| -- | -- | -- | -- | -- |

_The `fetch` client is used as `DefaultClient`._

All clients can be extended or re-implemented for each application's requirements. For example, a client can enable caching, modify headers or append a path prefix or a domain to endpoint URLs. The only requirement for a client is that it satisfies the `Client` interface available in [`rickety/client`](./client/index.ts).

The [`supertest`](./client/supertest) client also enables easy integration tests, as detailed in the [testing](#testing) section.

## Group

`TODO`

The group's request and response types can also be accessed using `typeof` on two special members. Accessing these by value with produce an error.

```typescript
type Request = typeof group.$req;
type Response = typeof group.$res;
```

## Testing

The endpoint's `call` function can be spied on to test behavior with mocked return values or assert on how it is being called.

```tsx
import {getUserData} from "../endpoints";
import {Homepage} from "../frontend/components";

test("homepage fetches correct user data", () => {
    const spy = jest.spyOn(getUserData, "call");
    spy.mockReturnValue({ ... });

    mount(<Homepage ... />);

    expect(spy).toHaveBeenCalledWith( ... );
});
```

The express app instance can be "linked" to test handler behavior.

```tsx
import {link} from "rickety/link";

import {createUserByEmail} from "../endpoints";
import {app} from "../backend/app";
import {database} from "../backend/database";

link.express(app);

test("new user is created in the database", async () => {
    const spy = jest.spyOn(database, "createUser");
    spy.mockReturnValue({ ... });

    await createUserByEmail( ... );

    expect(spy).toHaveBeenCalledWith( ... );
});
```

This linking pattern also enables integration tests which involve both client and server code.

```tsx
import {link} from "rickety/link";
import {mount} from "enzyme";

import {app} from "../backend/app";
import {database} from "../backend/database";
import {SignUp} from "../frontend/components";

link.express(app);

test("should refuse duplicate email addresses", async () => {
    const spy = jest.spyOn(database, "createUser");
    spy.mockReturnValue({ ... });

    const wrapper = mount(<SignUp ... />);
    const submit = wrapper.find('button');
    submit.simulate('click');

    expect(wrapper.find(".error")).toContain("...");
});
```

## License

[MIT](./LICENSE)
