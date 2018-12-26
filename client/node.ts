import {Client, ClientRequest, ClientResponse} from ".";

import https from "https";

export class NodeClient implements Client {
    public async send(request: ClientRequest) {
        return new Promise<ClientResponse>((resolve, reject) => {
            const req = https.request({
                method: request.method,
                path: request.url,
                headers: request.headers,
            }, (res) => {
                let data = "";
                res.on("data", (chunk) => data += chunk)
                res.on("error", reject);
                res.on("end", () => resolve({
                    body: data,
                    status: res.statusCode as number,
                }));
            });

            req.on("error", reject);

            req.write(request.body);
            req.end();
        });
    }
}
