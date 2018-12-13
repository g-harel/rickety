import Endpoint from "./endpoint";
import {Status, LooseConfig} from ".";

export interface LinkRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
}

export interface LinkResponse {
    status: Status;
    body: string;
}

export interface Link {
    (request: LinkRequest): Promise<LinkResponse>;
}

const defaultLink: Link = async (request) => {
    const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        credentials: "same-origin",
    });

    const body = await response.text();
    const status = response.status as Status;
    return {body, status};
};

export default class Client {
    /** @internal */
    // Link is invoked with an object representing an http
    // request. Its only responsibility is to return a similarly
    // structured response object.
    public link: Link = defaultLink;

    public use = (link: Link): Client => {
        this.link = link;
        return this;
    };

    public Endpoint = <RQ, RS>(config: LooseConfig): Endpoint<RQ, RS> => {
        return new Endpoint(this, config);
    };
}
