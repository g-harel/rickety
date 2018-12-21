import supertest from "supertest";

import {Client, ClientRequest, ClientResponse} from ".";

// SupertestClient uses the "supertest" package to directly
// query the application instead of going through the network.
// It is intended to be used for integration tests.
export class SupertestClient implements Client {
    private app: Express.Application;

    constructor(app: Express.Application) {
        this.app = app;
    }

    public async send(request: ClientRequest) {
        const method = request.method.toLowerCase();
        let req: supertest.Test = (supertest(this.app) as any)[method](request.url);

        Object.keys(request.headers).forEach((name) => {
            req = req.set(name, request.headers[name]);
        });

        req.send(request.body);
        return new Promise<ClientResponse>((resolve, reject) => {
            req.end((err, response) => {
                if (err) reject(err);
                resolve({
                    status: response.status as any,
                    body: JSON.stringify(response.body),
                });
            });
        });
    }
}
