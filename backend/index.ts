import fastify, { FastifyInstance } from "fastify";

const server: FastifyInstance = fastify();

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const addUser = (user: User) => {
  user.id = users.length + 1;
  users.push(user);
};

server.get("/users", async (request, reply) => {
  return users;
});

server.post<{ Body: User }>("/users", async (request, reply) => {
  // yolo validation
  if (!request.body.name) {
    reply.code(400);
    return { error: "Name is required" };
  } else if (users.some((user) => user.name === request.body.name)) {
    reply.code(409);
    return { error: "Name is already taken" };
  }
  addUser(request.body);
  return { user: request.body };
});

server.listen({ port: 3000 }, (err, address) => {
  console.log("h");
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
