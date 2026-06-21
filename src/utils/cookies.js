export const cookies = {
  getOptions: _req => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }),

  set: (res, name, value, options = {}) => {
    res.cookie(name, value, { ...cookies.getOptions(), ...options });
  },

  clearCookie: (res, name = {}) => {
    res.clearCookie(name, cookies.getOptions());
  },

  get: (req, name) => {
    return req.cookies[name];
  },
};
