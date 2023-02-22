import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fjwt from "fastify-jwt";
import swagger from "fastify-swagger";
import { withRefResolver } from "fastify-zod";
import userRoutes from "./modules/user/user.route";
import productRoutes from "./modules/product/product.route";
import { userSchemas } from "./modules/user/user.schema";
import { productSchemas } from "./modules/product/product.schema";
import { version } from "../package.json";

export const server = Fastify();

// TODO: move to types file
declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "fastify-jwt" {
  interface FastifyJWT {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}

server.register(fjwt, {
  // TODO: move secret to env
  secret: "supersecret",
});

server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.send(err);
    }
  }
);

server.get("/healthcheck", async () => {
  return { status: "ok" };
});

async function main() {
  // important to add schemas before calling server.register() routes
  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  server.register(
    swagger,
    withRefResolver({
      routePrefix: "/docs",
      exposeRoute: true,
      staticCSP: true,
      openapi: {
        info: {
          title: "Fastify API",
          description:
            "Building a blazing fast REST API with Node.js, PostgreSQL, Fastify and Swagger",
          version,
        },
      },
    })
  );

  server.register(userRoutes, { prefix: "api/users" });
  server.register(productRoutes, { prefix: "api/products" });

  try {
    await server.listen(3000, "0.0.0.0");
    console.log(`Server listening on http://localhost:3000`);
  } catch (err) {
    // server.log.error(err);
    console.error(err);
    process.exit(1);
  }
}

main();
