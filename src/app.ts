import Fastify from "fastify";
import userRoutes from "./modules/user/user.route";
import { userSchemas } from "./modules/user/user.schema";

const server = Fastify();

server.get("/healthcheck", async () => {
  return { status: "ok" };
});

async function main() {
  // important to add schemas before calling server.register() routes
  for (const schema of userSchemas) {
    server.addSchema(schema);
  }

  server.register(userRoutes, { prefix: "/api/users" });
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
