// src/docs/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dhya Social Crumbs API",
      version: "1.0.0",
      description: "API documentation for DhyaSocialCrumbs Backend",
    },
    servers: [
      {
        url: "http://localhost:5001/api",
        description: "Development server",
      },
      {
  url: "https://dhyasocialcrumbs-backend-qhna.onrender.com/api",
  description: "Production server",
},
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;