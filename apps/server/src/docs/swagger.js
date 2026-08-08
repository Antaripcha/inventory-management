import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory Management System API",
      version: "1.0.0",
      description:
        "REST API for the Inventory Management System — authentication, products, categories, inventory transactions, dashboard analytics and audit logs.",
      contact: { name: "Inventory Management" },
    },
    servers: [{ url: "/api", description: "API base path" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
