import chalk from "chalk";

import {app} from "./app";

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log(chalk.bold.magentaBright(`http://localhost:${port}\n`));
});
