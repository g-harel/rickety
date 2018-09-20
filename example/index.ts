import {app} from "./server";
import {run} from "./client";

app.listen(3000, async () => {
    console.log("listening on 3000");

    await run();

    process.exit(0);
});
