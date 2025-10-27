import "reflect-metadata";
import { DwexFactory } from "@dwex/core";
import { RootModule } from "./root.module";

const app = await DwexFactory.create(RootModule);

const port = 3001;
await app.listen(port);
