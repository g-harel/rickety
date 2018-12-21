import request from "request";

import {Client, ClientRequest, ClientResponse} from ".";

// RequestClient uses the "request" package to send requests.
export class RequestClient implements Client {
    public async send(req: ClientRequest) {
        return new Promise<ClientResponse>((resolve, reject) => {
            request({
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body,
                callback: (error, res, body) => {
                    if (error) reject(error);
                    resolve({body, status: res.statusCode});
                },
            });
        });
    }
}
