import express from "express";
import supertest from "supertest";

import {Sender, SenderResponse} from ".";

// This sender uses supertest to simulate requests being sent to the
// given express app. It can be used during integration tests to
// avoid the network entirely.
export const sender = (app: express.Express): Sender => async (request) => {
    const method = request.method.toLowerCase();
    let req: supertest.Test = (supertest(app) as any)[method](request.url);
    Object.keys(request.headers).forEach((name) => {
        req = req.set(name, request.headers[name]);
    });
    req.send(request.body)
    return new Promise<SenderResponse>((resolve, reject) => {
        req.end((err, response) => {
            if (err) reject(err);
            resolve({
                status: response.status as any,
                body: JSON.stringify(response.body),
            })
        });
    });
}