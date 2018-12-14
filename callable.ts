export abstract class Callable<RQ, RS> {
    // Exposes request and response types to make them easier
    // to access when interacting with a callable object.
    // ex. `const req: typeof Callable.$Request = {...}`
    public get $Request(): RQ {
        throw new Error(`rickety: Request cannot be accessed as value`);
    }
    public get $Response(): RS {
        throw new Error(`rickety: Response cannot be accessed as value`);
    }

    abstract call(requestData: RQ): Promise<RS>;
}
