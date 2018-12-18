export interface ClientRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: string;
}

export interface ClientResponse {
    status: number;
    body: string;
}

export interface Client {
    send: (request: ClientRequest) => Promise<ClientResponse>;
}
