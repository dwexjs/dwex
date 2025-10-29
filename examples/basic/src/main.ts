import "reflect-metadata";
import { DwexFactory } from "@dwex/core";
import { AppModule } from "./app.module";

const app = await DwexFactory.create(AppModule);

const port = 9929;
await app.listen(port);
