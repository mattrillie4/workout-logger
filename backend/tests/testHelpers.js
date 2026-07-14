const request = require("supertest");
const app = require("../app");

// creates new unique test email, to avoid 409 errors
const makeTestEmail = () => {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
};

// registers a new user to the database
const createNewUser = async () => {
  const user = {
    email: makeTestEmail(),
    password: "TestPassword123!",
  };

  await request(app).post("/user/register").send(user);

  return user;
};

// login a test user and save the token
const createTestUserAndToken = async () => {
  const user = await createNewUser();

  const loginResponse = await request(app)
    .post("/user/login")
    .send({ email: user.email, password: user.password });

  return {
    user,
    token: loginResponse.body.token,
  };
};

module.exports = {
  makeTestEmail,
  createNewUser,
  createTestUserAndToken,
};
