import {Client} from "..";
import {LinkRequest} from "../link";

describe("send", () => {
    it("should concatenate the base and the path to form the url", async () => {
        const client = new Client("/base123");
        const request: LinkRequest = {
            method: "GET",
            headers: {},
            body: "{}",
            url: "/path123",
        };

        client.use(async (req) => {
            expect(req.url).toBe(client.base + request.url);
            return {body: "{}", status: 200};
        });
        await client.send(request);
    });
});
