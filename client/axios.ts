import axios from "axios";

import {Client, ClientRequest} from ".";

// AxiosClient uses the "request" package to send requests.
export class AxiosClient implements Client {
    public async send(request: ClientRequest) {
        const res = await axios({
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
        } as any);

        return {body: res.data, status: res.status};
    }
}
