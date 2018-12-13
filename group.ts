import Endpoint from "./endpoint";

export interface Callable<RQ, RS> {
    call(requestData: RQ): Promise<RS>;
}

export interface Group {
    [name: string]: Group | Callable<any, any>;
}

export type GroupRequest<G extends Group> = {
    [N in keyof G]: G[N] extends Group
        ? GroupRequest<G[N]>
        : G[N] extends Callable<infer RQ, infer _> ? RQ : never
};

export type GroupResponse<G extends Group> = {
    [N in keyof G]: G[N] extends Group
        ? GroupResponse<G[N]>
        : G[N] extends Callable<infer _, infer RS> ? RS : never
};

const read = (obj: any, addr: string[]): any => {
    let current = obj;
    for (let i = 0; i < addr.length; i++) {
        const key = addr[i];

        if (i === addr.length - 1) {
            return current[key];
        }

        if (!current[key]) {
            const prettyObj = JSON.stringify(obj, null, 2);
            throw new Error(`invalid read address [${addr}] in\n${prettyObj}`);
        }
        current = current[key];
    }
};

const write = (obj: any, addr: string[], value: any) => {
    let current = obj;
    for (let i = 0; i < addr.length; i++) {
        const key = addr[i];

        if (i === addr.length - 1) {
            current[key] = value;
            return;
        }

        if (!current[key]) {
            current[key] = {};
        }
        current = current[key];
    }
};

const isCallable = (c: any): c is Callable<any, any> => {
    if (!c.call) {
        return false;
    }
    return c instanceof Endpoint || c instanceof EndpointGroup;
};

export default class EndpointGroup<G extends Group>
    implements Callable<GroupRequest<G>, GroupResponse<G>> {
    private group: G;

    constructor(group: G) {
        this.group = group;
    }

    public call = async (request: GroupRequest<G>): Promise<GroupResponse<G>> => {
        const promises: Array<Promise<any>> = [];
        const addresses: string[][] = [];

        const call = (obj: any, addr: string[]): void => {
            Object.keys(obj).forEach((key) => {
                const current = obj[key];
                const currentAddr = [...addr, key];
                if (isCallable(current)) {
                    promises.push(current.call(read(request, currentAddr)));
                    addresses.push(currentAddr);
                    return;
                }
                call(current, currentAddr);
            });
        };
        call(this.group, []);

        const response = {};
        const results = await Promise.all(promises);
        results.forEach((result, i) => {
            write(response, addresses[i], result);
        });
        return response as any;
    };
}
