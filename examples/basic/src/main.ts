import "reflect-metadata";
import { DwexFactory, createServeStaticMiddleware } from "@dwex/core";
import { AppModule } from "./app.module";

const app = await DwexFactory.create(AppModule);

// Set global prefix for all API routes (does not affect static files)
app.setGlobalPrefix("api");

// Serve static files from public directory with SPA support
// Exclude /api routes so they're handled by controllers
app.use(
	createServeStaticMiddleware({
		rootPath: "./public",
		serveRoot: "/",
		spa: true,
		exclude: ["/api"],
	}),
);

const port = 9929;
await app.listen(port);
