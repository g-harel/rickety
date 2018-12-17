import supertest from "supertest";

import {Link, LinkResponse} from ".";

// Supertest link uses the "supertest" package to directly query the
// application instead of going through the network. It is intended
// to be used for integration tests.
export const supertestLink = (app: Express.Application): Link => async (request) => {
    const method = request.method.toLowerCase();
    let req: supertest.Test = (supertest(app) as any)[method](request.url);
    Object.keys(request.headers).forEach((name) => {
        req = req.set(name, request.headers[name]);
    });
    req.send(request.body);
    return new Promise<LinkResponse>((resolve, reject) => {
        req.end((err, response) => {
            if (err) reject(err);
            resolve({
                status: response.status as any,
                body: JSON.stringify(response.body),
            });
        });
    });
};
