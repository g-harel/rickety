import {Callable} from "./callable";

export interface GroupTemplate {
    [name: string]: GroupTemplate | Callable<any, any>;
}

export type GroupRequest<G extends GroupTemplate> = {
    [N in keyof G]: G[N] extends GroupTemplate
        ? GroupRequest<G[N]>
        : G[N] extends Callable<infer RQ, infer _> ? RQ : never
};

export type GroupResponse<G extends GroupTemplate> = {
    [N in keyof G]: G[N] extends GroupTemplate
        ? GroupResponse<G[N]>
        : G[N] extends Callable<infer _, infer RS> ? RS : never
};

export const read = (obj: any, addr: string[]): any => {
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

export const write = (obj: any, addr: string[], value: any) => {
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

export class Group<G extends GroupTemplate> extends Callable<
    GroupRequest<G>,
    GroupResponse<G>
> {
    private group: G;

    constructor(group: G) {
        super();
        this.group = group;
    }

    public call = async (request: GroupRequest<G>): Promise<GroupResponse<G>> => {
        const promises: Array<Promise<any>> = [];
        const addresses: string[][] = [];

        const call = (obj: any, addr: string[]): void => {
            Object.keys(obj).forEach((key) => {
                const current = obj[key];
                const currentAddr = [...addr, key];
                if (current instanceof Callable) {
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
