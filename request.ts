import {Headers, StrictConfig} from ".";

type Sender = (config: StrictConfig, data: any, headers: Headers[]) => Promise<any>;

const unexpectedStatusText = "Unexpected status";

// The request function sends requests to the configured
// endpoint. It is platform agnostic and will work with either
// node or browser globals without dependencies. It returns a
// promise which may throw errors if there is an issue with
// the request process or if the status is unexpected.
export const request: Sender = async (config, data, headers) => {
    if (typeof window === "undefined") {
        return serverSender(config, data, headers);
    }
    return browserSender(config, data, headers);
};

const browserSender: Sender = async (config, data, headers) => {
    return new Promise((resolve, reject) => {
        const port = config.port === 80 ? "" : `:${config.port}`;
        const url = `${config.host}${port}${config.path}`;
        const http = new XMLHttpRequest();

        const h = Object.assign({}, ...headers);
        Object.keys(h).forEach((name) => {
            http.setRequestHeader(name, h[name]);
        });

        http.open(config.method, url, true);
        http.onreadystatechange = () => {
            if (http.readyState !== 4) {
                return;
            }
            if (config.expect.indexOf(http.status as any) < 0) {
                reject(Error(unexpectedStatusText));
            }
            resolve(JSON.parse(http.responseText));
        };

        http.send(JSON.stringify(data));
    });
};

const serverSender: Sender = async (config, data, headers) => {
    // To avoid having code bundlers sniff out that the http
    // package is being used, the use of the require function
    // is hidden using an eval statement.
    const sneakyRequire = eval("require");
    const http = sneakyRequire("http");

    return new Promise((resolve, reject) => {
        const req = http.request(
            {
                ...config,
                headers: Object.assign({}, ...headers),
            },
            (res: any) => {
                let data = "";
                res.on("data", (chunk: string) => (data += chunk));
                res.on("end", () => {
                    if (config.expect.indexOf(res.statusCode as any) < 0) {
                        reject(Error(unexpectedStatusText));
                    }
                    resolve(JSON.parse(data));
                });
            },
        );

        req.write(JSON.stringify(data));
        req.end();
    });
};
