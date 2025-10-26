import { DwexFactory } from "@dwex/core";
import { DocumentBuilder, OpenApiModule } from "@dwex/openapi";
import { AppModule } from "./app.module.js";

/**
 * Bootstrap the application
 */
async function bootstrap() {
  // Create the Dwex application
  const app = await DwexFactory.create(AppModule);

  // Create OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle("Dwex OpenAPI Example API")
    .setDescription(
      "Example API demonstrating OpenAPI integration with Dwex framework"
    )
    .setVersion("1.0.0")
    .setContact("Dwex Team", "https://github.com/dwexjs/dwex", "")
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .addServer("http://localhost:3000", "Local development server")
    .addTag("general", "General API endpoints")
    .addTag("users", "User management endpoints")
    .addBearerAuth({
      name: "bearer",
      description: "JWT Authorization header using Bearer scheme",
      bearerFormat: "JWT",
    })
    .build();

  // Generate the OpenAPI document
  const document = OpenApiModule.createDocument(app, config);

  // Setup Swagger UI at /docs
  OpenApiModule.setup("/docs", app, document, {
    customSiteTitle: "Dwex API Documentation",
    darkMode: true,
  });

  // Start the server
  const port = 3001;
  await app.listen(port);
}

// Run the application
bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
