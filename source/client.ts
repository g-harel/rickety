import {defaultLink} from "../link/default";

export interface LinkRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
}

export interface LinkResponse {
    status: number;
    body: string;
}

export interface Link {
    (request: LinkRequest): Promise<LinkResponse>;
}

export class Client {
    // Link is invoked with an object representing an http
    // request. Its only responsibility is to return a similarly
    // structured response object.
    public readonly link: Link = defaultLink;

    // The base should contain everything in the url before
    // the path. Default value of "" will send requests to the
    // same domain.
    public readonly base: string;

    public constructor(base: string = "") {
        this.base = base;
    }

    /** @internal */
    public send: Link = async (request) => {
        request = Object.assign({}, request, {
            url: this.base + request.url,
        });
        return this.link(request);
    };

    public use = (link: Link): Client => {
        (this as any).link = link;
        return this;
    };
}
