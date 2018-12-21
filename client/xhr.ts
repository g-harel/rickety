import {Client, ClientRequest, ClientResponse} from ".";

// XHRClient uses the browser's XHR api to send requests.
export class XHRClient implements Client {
    public async send(request: ClientRequest) {
        const req = new XMLHttpRequest();
        req.open(request.method, request.url, true);

        Object.keys(request.headers).forEach((name) => {
            req.setRequestHeader(name, request.headers[name]);
        });

        req.send();
        return new Promise<ClientResponse>((resolve) => {
            req.onreadystatechange = () => {
                if (req.readyState === 4) {
                    resolve({
                        body: req.responseText,
                        status: req.status,
                    });
                }
            };
        });
    }
}
