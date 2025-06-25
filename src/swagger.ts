import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

// No `servers` here, since we will override with `swaggerOptions.urls`
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "JackpotX API",
    version: "1.0.0",
    description: "API documentation for JackpotX backend",
  },
};

export const options: any = {
  swaggerDefinition,
  apis: ["./src/routes/**/*.ts", "./src/api/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  console.log("Loaded Swagger paths:", Object.keys(swaggerSpec.paths));

  // Serve JSON schema for Swagger UI dropdown
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve Swagger UI on a proper path (not "/")
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerOptions: {
      urls: [
        {
          url: "https://backend.jackpotx.net/api-docs.json",
          name: "Production (HTTPS)",
        },
        {
          url: "http://185.209.229.198:3000/api-docs.json",
          name: "Local (HTTP)",
        },
      ],
      urlsPrimaryName: "Production (HTTPS)",
      docExpansion: "none",
      validatorUrl: null,
    },
  }));
  app.get("/", (_req, res) => {
    res.redirect("/docs");
  });
};

export { swaggerSpec };