import api from "./api";

export const signUp = async (payload) => {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
};

export const signIn = async (payload) => {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/api/auth/me");
  return data;
};
