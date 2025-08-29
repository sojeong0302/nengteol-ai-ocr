import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { configDotenv } from "dotenv";

configDotenv();

const HOST = process.env.HOST;
const PORT = process.env.PORT;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Refrigerator", // 문서 제목
      version: "1.0.0",
      description: "냉장고 API 문서",
    },
    servers: [
      {
        url: `http://${HOST}:${PORT}`,
      },
    ],
  },
  apis: ["./src/router/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
