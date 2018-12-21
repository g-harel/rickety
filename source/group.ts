import {Callable} from "./callable";

// Plain object containing other plain objects or Callable
// entities. This is the type of the input argument when
// creating a new Group.
export interface GroupTemplate {
    [name: string]: GroupTemplate | Callable<any, any>;
}

// Transforms the GroupTemplate into a type with the same
// shape, but where the Callable entities are replaced with
// their request types. This type is used when calling an
// instanciated group.
// prettier-ignore
export type GroupRequest<G extends GroupTemplate> = {
    [N in keyof G]:
        G[N] extends GroupTemplate ? GroupRequest<G[N]> :
        G[N] extends Callable<infer RQ, infer _> ? RQ :
        never
};

// Transforms the GroupTemplate into a type with the same
// shape, but where the Callable entities are replaced with
// their response types. This type is the return value of
// calling a group.
// prettier-ignore
export type GroupResponse<G extends GroupTemplate> = {
    [N in keyof G]:
        G[N] extends GroupTemplate ? GroupResponse<G[N]> :
        G[N] extends Callable<infer _, infer RS> ? RS :
        never
};

// Helper to read an object's property at the given address.
// The `undefined` value is not treated as incorrect if it
// is found at the final destination.
export const read = (obj: any, addr: string[]): any => {
    let current = obj;
    for (let i = 0; i < addr.length; i++) {
        const key = addr[i];

        if (i === addr.length - 1) {
            return current[key];
        }

        if (current[key] === undefined) {
            const lines = [
                `GroupError (invalid request data)`,
                ` missing value at [${addr}] in`,
                `  ${JSON.stringify(obj, null, 2)}`,
            ];
            throw new Error(lines.join("\n"));
        }
        current = current[key];
    }
};

// Helper to write a value in an object at a given address.
// If the address contains missing objects, they are all
// added until the final destination is written to.
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

// Groups combine multiple Callable entities into a single one
// which preserves the strongly typed requests and responses.
// Groups can be used inside other groups.
export class Group<G extends GroupTemplate> extends Callable<
    GroupRequest<G>,
    GroupResponse<G>
> {
    private group: G;

    constructor(group: G) {
        super();
        this.group = group;
    }

    // Recursively travels the template to call all of its
    // members with the given request data. The responses are
    // collected, formed into the correct type and returned.
    public call = async (request: GroupRequest<G>): Promise<GroupResponse<G>> => {
        // The pending responses and their position in the
        // response object is tracked.
        const pending: Array<Promise<any>> = [];
        const position: string[][] = [];

        // Recursively travels the group's template, calling
        // the Callable leaf nodes and storing the response
        // promise and the address in the template.
        const call = (obj: any, addr: string[]): void => {
            Object.keys(obj).forEach((key) => {
                const current = obj[key];
                const currentAddr = [...addr, key];
                if (current instanceof Callable) {
                    pending.push(current.call(read(request, currentAddr)));
                    position.push(currentAddr);
                    return;
                }
                call(current, currentAddr);
            });
        };
        call(this.group, []);

        // Response object is rebuilt from the results and
        // the stored positions.
        const response = {};
        const results = await Promise.all(pending);
        results.forEach((result, i) => {
            write(response, position[i], result);
        });
        return response as any;
    };
}
