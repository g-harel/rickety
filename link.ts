import supertest from "supertest";

import {Endpoint, Headers, Status} from ".";

export interface SenderResponse {
    status: Status;
    body: string;
}

export interface SenderRequest {
    method: string;
    url: string;
    headers: Headers;
    body: string;
}

export interface Sender {
    (request: SenderRequest): Promise<SenderResponse>;
}

// Default sender is stored to make it possible unlink.
const backup: Sender = (Endpoint as any).sender;

// Express link uses the "supertest" package to directly query the
// application instead of going through the network. It is intended
// to be used for integration tests.
const express = (app: any) => {
    const sender: Sender = async (request) => {
        const method = request.method.toLowerCase();
        let req: supertest.Test = (supertest(app) as any)[method](request.url);
        Object.keys(request.headers).forEach((name) => {
            req = req.set(name, request.headers[name]);
        });
        req.send(request.body);
        return new Promise<SenderResponse>((resolve, reject) => {
            req.end((err, response) => {
                if (err) reject(err);
                resolve({
                    status: response.status as any,
                    body: JSON.stringify(response.body),
                });
            });
        });
    };
    (Endpoint as any).sender = sender;
};

export const link = {
    express,
};

// Restore initial sender, requests will attempt to query the network.
export const unlink = () => {
    (Endpoint as any).sender = backup;
};
