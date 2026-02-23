import client from "./client";

export const entriesApi = {
  list: (params) => client.get("/entries", { params }).then((r) => r.data),
  get: (id) => client.get(`/entries/${id}`).then((r) => r.data),
  create: (data) => client.post("/entries", data).then((r) => r.data),
  update: (id, data) => client.put(`/entries/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/entries/${id}`).then((r) => r.data),
  togglePin: (id) => client.patch(`/entries/${id}/pin`).then((r) => r.data),
};
