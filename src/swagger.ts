// src/swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
const host = process.env.HOST || "localhost";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "JackpotX API",
    version: "1.0.0",
    description: "API documentation for JackpotX backend",
  },
  servers: [
    {
      url: `http://185.209.229.198:8080`,
      description: "Production server",
    },
  ],
};

const options = {
  definition: swaggerDefinition, 
  apis: ["./src/routes/**/*.ts", "./src/api/**/*.ts"], 
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  console.log("Loaded Swagger paths:", Object.keys(swaggerSpec.paths)); 
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
};