import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";

const server: FastifyInstance = Fastify({});

interface User {
  id: number;
  name: string;
  habits?: Habit[];
}

type HabitFrequency = "daily" | "weekly" | "monthly";

interface Habit {
  id: number;
  name: string;
  frequency: HabitFrequency;
}

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

const addUser = (user: User) => {
  user.id = users.length + 1;
  users.push(user);
};

const addHabit = (userId: number, habit: Habit) => {
  const user = users.find((user) => user.id === userId);
  if (user) {
    if (!user.habits) {
      user.habits = [];
    }
    if (!habit.frequency) {
      habit.frequency = "daily";
    }
    habit.id = user.habits.length + 1;

    user.habits.push(habit);
  }
};

server.get("/users", async () => {
  return users;
});

server.get(
  "/users/:userId",
  async (request: FastifyRequest<{ Params: { userId: number } }>, reply) => {
    const user = users.find(
      (user) => user.id === Number(request.params.userId),
    );
    if (!user) {
      reply.code(404);
      return { error: "User not found" };
    }
    return user;
  },
);

server.post<{ Body: User }>("/users", async (request, reply) => {
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

type HabitParams = { userId: string };

server.post(
  "/users/:userId/habits",
  async (
    request: FastifyRequest<{ Params: HabitParams; Body: Habit }>,
    reply,
  ) => {
    const user = users.find(
      (user) => user.id === Number(request.params.userId),
    );
    if (!user) {
      reply.code(404);
      return { error: "User not found" };
    }
    if (!request.body.name) {
      reply.code(400);
      return { error: "Name is required" };
    }
    if (!request.body.frequency) {
      reply.code(400);
      return { error: "Frequency is required" };
    }
    if (!["daily", "weekly", "monthly"].includes(request.body.frequency)) {
      reply.code(400);
      return { error: "Frequency must be daily, weekly or monthly" };
    }
    if (!user.habits) {
      user.habits = [];
    }
    request.body.id = user.habits.length + 1;
    user.habits.push(request.body);
    return { habit: request.body };
  },
);

type DeleteHabitParams = { userId: string; habitId: string };

server.delete(
  "/users/:userId/habits/:habitId",
  async (
    request: FastifyRequest<{ Params: DeleteHabitParams }>,
    reply: FastifyReply,
  ) => {
    const user = users.find(
      (user) => user.id === Number(request.params.userId),
    );
    if (!user) {
      reply.code(404);
      return { error: "User not found" };
    }
    if (!user.habits) {
      console.log("user has no habits");
      return { error: "Habit not found" };
    }
    const habitIndex = user.habits.findIndex(
      (habit) => habit.id === Number(request.params.habitId),
    );
    if (habitIndex === -1) {
      console.log("cant find this specify habit");
      reply.code(404);
      return { error: "Habit not found" };
    }
    user.habits.splice(habitIndex, 1);
    return { success: true };
  },
);

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
