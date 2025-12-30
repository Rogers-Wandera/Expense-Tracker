export const baseUrl = `${process.env.NEXT_BASE_URL}`;
console.log("baseUrl ", baseUrl);

export const endpoints = {
  auth: {
    login: "/auth/login",
  },
};

export const routes = {
  public: {
    login: "/auth/login",
  },
};
