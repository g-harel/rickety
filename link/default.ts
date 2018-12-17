import {Link} from ".";

export const defaultLink: Link = async (request) => {
    const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        credentials: "same-origin",
    });

    const body = await response.text();
    const status = response.status;
    return {body, status};
};