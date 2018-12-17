import {Callable} from "./callable";

class ConcreteCallable<RQ, RS> extends Callable<RQ, RS> {
    call = async () => {
        return (null as any) as RS;
    };
}

it("should expose the request type", () => {
    const c = new ConcreteCallable<number, string>();
    let n: typeof c.$req = 0;
    n = n;
});

it("should expose the response type", () => {
    const c = new ConcreteCallable<number, string>();
    let s: typeof c.$res = "";
    s = s;
});

it("should not allow access to $Request member", () => {
    const c = new ConcreteCallable();
    expect(() => c.$req).toThrow(/rickety/);
});

it("should not allow access to $Response member", () => {
    const c = new ConcreteCallable();
    expect(() => c.$res).toThrow(/rickety/);
});
