import client from "./client";

export const statsApi = {
  overview: () => client.get("/stats/overview").then((r) => r.data),
  moods: (params) => client.get("/stats/moods", { params }).then((r) => r.data),
  activity: (params) => client.get("/stats/activity", { params }).then((r) => r.data),
  tags: () => client.get("/stats/tags").then((r) => r.data),
};
