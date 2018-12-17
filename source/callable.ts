export abstract class Callable<RQ, RS> {
    // Exposes request and response types to make them easier
    // to access when interacting with a callable object.
    // ex. `const req: typeof Callable.$Request = {...}`
    public get $req(): RQ {
        throw new Error(`rickety: Request cannot be accessed as value`);
    }
    public get $res(): RS {
        throw new Error(`rickety: Response cannot be accessed as value`);
    }

    abstract call(requestData: RQ): Promise<RS>;
}
