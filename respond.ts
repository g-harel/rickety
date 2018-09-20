import express from "express";

import {RequestHandler, StrictConfig} from ".";

// Respond generates an express request handler from a config
// and a request handling function.
export const respond = (
    config: StrictConfig,
    // Specific types do not matter in this scope since the
    // data is not being manipulated directly.
    handler: RequestHandler<any, any>,
): express.RequestHandler => async (req, res, next) => {
    // Only requests with the correct path and method are handled.
    if (req.path !== config.path) {
        return next();
    }
    if (req.method !== config.method) {
        return next();
    }

    // Handler is not invoked if a different handler has
    // already answered the request. This situation is
    // considered an error since the handler should have
    // been used.
    if (res.headersSent) {
        return next(new Error("Response has already been sent."));
    }

    // Request body is streamed into a string to be parsed.
    const rawRequestData = await new Promise<string>((resolve) => {
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
    });

    let rawResponseData: string = "";
    try {
        const requestData = JSON.parse(rawRequestData);
        const responseData = await handler(requestData, req, res);
        rawResponseData = JSON.stringify(responseData);
    } catch (e) {
        // Handler and serialization errors are forwarded to
        // express to be handled gracefully.
        return next(e);
    }

    // Although the handler is given access to the express
    // response object, it should not send the data itself.
    if (res.headersSent) {
        return next(new Error("Response was sent by handler."));
    }

    res.status(200);
    res.send(rawResponseData);
    return next();
};
