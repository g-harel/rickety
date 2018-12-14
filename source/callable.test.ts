import {Callable} from "./callable";

class ConcreteCallable<RQ, RS> extends Callable<RQ, RS> {
    call = async () => {
        return (null as any) as RS;
    };
}

it("should expose the request type", () => {
    const c = new ConcreteCallable<number, string>();
    let n: typeof c.$Request = 0;
    n = n;
});

it("should expose the response type", () => {
    const c = new ConcreteCallable<number, string>();
    let s: typeof c.$Response = "";
    s = s;
});

it("should not allow access to $Request member", () => {
    const c = new ConcreteCallable();
    expect(() => c.$Request).toThrow(/rickety/);
});

it("should not allow access to $Response member", () => {
    const c = new ConcreteCallable();
    expect(() => c.$Response).toThrow(/rickety/);
});
