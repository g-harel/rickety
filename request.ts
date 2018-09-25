import {Headers, Status} from ".";

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

export const browserSender: Sender = async (request) => {
    return new Promise<SenderResponse>((resolve) => {
        const http = new XMLHttpRequest();

        http.open(request.method, request.url, true);

        Object.keys(request.headers).forEach((name) => {
            http.setRequestHeader(name, request.headers[name]);
        });

        http.onreadystatechange = () => {
            if (http.readyState === 4) {
                resolve({
                    status: http.status,
                    body: http.responseText,
                } as any);
            }
        };

        http.send(request.body);
    });
};

export const serverSender: Sender = async (request) => {
    // To avoid having code bundlers sniff out that the http
    // package is being used, the use of the require function
    // is hidden using an eval statement.
    const sneakyRequire = eval("require");
    const http = sneakyRequire("http");

    return new Promise<SenderResponse>((resolve, reject) => {
        const req = http.request(
            request.url,
            {
                method: request.method,
                headers: request.headers,
            },
            (res: any) => {
                let data = "";
                res.on("data", (chunk: string) => (data += chunk));
                res.on("end", () => {
                    resolve({
                        status: res.statusCode,
                        body: data,
                    } as any);
                });
            },
        );

        req.write(request.body, (err?: Error) => {
            req.end();
            if (err !== undefined) {
                reject(err);
            }
        });
    });
};
