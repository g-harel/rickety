import "isomorphic-unfetch";

import {app} from "./server";
import {run} from "./client";

app.listen(3000, async () => {
    console.log("listening on 3000");

    await run().catch(console.error);

    process.exit(0);
});
