import client from "./client";

export const memoriesApi = {
  onThisDay: () => client.get("/memories/on-this-day").then((r) => r.data),
  random: () => client.get("/memories/random").then((r) => r.data),
  timeline: (params) => client.get("/memories/timeline", { params }).then((r) => r.data),
  heatmap: (params) => client.get("/memories/heatmap", { params }).then((r) => r.data),
};
