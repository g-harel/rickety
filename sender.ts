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
