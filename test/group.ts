import {Endpoint, Group} from "..";

// Helper to generate endpoints with mocked clients.
const genMockedEndpoint = () => {
    return new Endpoint({
        client: {
            send: jest.fn(() => ({
                body: "{}",
                status: 200,
            })),
        },
        path: "/" + Math.random(),
    });
};

// Helper to generate endpoints with a client that mirrors
// request data in the response.
const genMirrorEndpoint = () => {
    return new Endpoint({
        client: {
            send: async (req) => ({
                body: req.body,
                status: 200,
            }),
        },
        path: "/" + Math.random(),
    });
};

//

it("should call all endpoints with the correct data", async () => {
    const a = genMockedEndpoint();
    const b = genMockedEndpoint();
    const request = {a: 0, b: 1};

    const group = new Group({a, b});
    await group.call(request);

    expect(a.client.send).toHaveBeenCalledWith(
        expect.objectContaining({
            body: JSON.stringify(request.a),
        }),
    );
    expect(b.client.send).toHaveBeenCalledWith(
        expect.objectContaining({
            body: JSON.stringify(request.b),
        }),
    );
});

it("should return the correct response data", async () => {
    const a = genMockedEndpoint();
    const b = genMockedEndpoint();
    const response = {a: 0, b: 1};

    (a.client.send as jest.Mock).mockReturnValue({
        body: response.a.toString(),
        status: 200,
    });
    (b.client.send as jest.Mock).mockReturnValue({
        body: response.b.toString(),
        status: 200,
    });

    const group = new Group({a, b});
    const res = await group.call({a: {}, b: {}});

    expect(res).toEqual(response);
});

it("should reject entire response if one call fails", async () => {
    const a = genMockedEndpoint();
    const b = genMockedEndpoint();
    const group = new Group({a, b});
    const message = String(Math.random());

    (b.client.send as jest.Mock).mockImplementationOnce(() => {
        throw new Error(message);
    });

    await expect(group.call({a: {}, b: {}})).rejects.toThrow(message);
});

it("should correctly handle deeply nested data", async () => {
    const group = new Group({
        a: {
            a: {
                a: {
                    a: genMirrorEndpoint(),
                    b: genMirrorEndpoint(),
                },
            },
            b: genMirrorEndpoint(),
            c: genMirrorEndpoint(),
        },
        b: genMirrorEndpoint(),
    });

    const obj: typeof group.$req = {
        a: {
            a: {
                a: {
                    a: Math.random(),
                    b: Math.random(),
                },
            },
            b: Math.random(),
            c: Math.random(),
        },
        b: Math.random(),
    };

    await expect(group.call(obj)).resolves.toEqual(obj);
});

it("should support nested groups", async () => {
    const inner = new Group({
        test: genMirrorEndpoint(),
        inside: {
            a: genMirrorEndpoint(),
        },
    });
    const group = new Group({
        test1: genMirrorEndpoint(),
        test2: inner,
        test3: {
            b: {
                c: inner,
            },
        },
    });

    const obj: typeof group.$req = {
        test1: Math.random(),
        test2: {
            test: Math.random(),
            inside: {
                a: Math.random(),
            },
        },
        test3: {
            b: {
                c: {
                    test: Math.random(),
                    inside: {
                        a: Math.random(),
                    },
                },
            },
        },
    };

    await expect(group.call(obj)).resolves.toEqual(obj);
});
