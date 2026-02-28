import client from "./client";

export const achievementApi = {
  list: () => client.get("/achievements").then((r) => r.data),
  check: () => client.post("/achievements/check").then((r) => r.data),
  getGoal: () => client.get("/achievements/goal").then((r) => r.data),
  updateGoal: (data) => client.put("/achievements/goal", data).then((r) => r.data),
  getGoalProgress: () => client.get("/achievements/goal/progress").then((r) => r.data),
};
