<!--

TODO
- make errors more helpful / clear
- allow sync runtime type checks (isRequest, isResponse)
- add react in example/frontend
- add tests in example

CHANGELOG
- design a complete testing story (ex. calling handlers without the network)
- make sender private
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
    constructor(path: string);
    constructor(config: Config);

    call(data: RQ, ...headers: Headers[]): Promise<RS>;
    handler(handler: RequestHandler<RQ, RS>): express.RequestHandler;
}
```

## Testing

When testing clients, the endpoint's `call` function can be spied on to test behavior with mocked return values or assert on how it is being called.

```tsx
import {getUserData} from "../endpoints";

test("homepage fetches data", () => {
    const spy = jest.spyOn(getUserData, "call");
    spy.mockReturnValue({ ... });

    mount(<Homepage ... />);

    expect(spy).toHaveBeenCalledWith( ... );
});
```

For integration tests, the express app instance can be linked to the endpoints directly. This means clients can invoke handlers as they normally would, but rickety will not involve the network.

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

test("new sign-ups should add a user to the database", async () => {
    const spy = jest.spyOn(database, "createUser");
    spy.mockReturnValue({ ... });

    const wrapper = mount(<SignUp ... />);
    const submit = wrapper.find('button');
    submit.simulate('click');

    expect(spy).toHaveBeenCalledWith( ... );
});
```

## License

[MIT](./LICENSE)
