<!--

TODO
- add react in example/frontend
- add more tests in example

 -->

# rickety [![](https://img.shields.io/npm/v/rickety.svg)](https://www.npmjs.com/package/rickety) [![](https://travis-ci.org/g-harel/rickety.svg?branch=master)](https://travis-ci.org/g-harel/rickety) [![](https://img.shields.io/npm/types/rickety.svg)](https://github.com/g-harel/rickety)

> minimal typescript rpc framework

* [Strongly typed endpoints](#usage)
* [Simple interface](#api)
* [Convenient testing](#testing)
* [No runtime dependencies](/package.json)

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
        // ...
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
