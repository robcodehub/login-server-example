const express = require("express");
const app = express();
const session = require("express-session");
const volleyball = require("volleyball");
const db = require("./db");
const { User } = db.models;

app.use(volleyball);

const sessionConfig = {
  secret: process.env.SECRET || "a random secret string for encoding purpose",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
};

app.use(session(sessionConfig));
app.use(express.json());

const port = process.env.PORT || 3000;
db.syncAndSeed().then(() =>
  app.listen(port, () => console.log(`listening on port ${port}`))
);

app.post("/api/sessions", (req, res, next) => {
  User.findOne({
    where: {
      username: req.body.username,
      password: req.body.password
    }
  })
    .then(user => {
      if (!user) {
        throw { status: 401, message: "error: authentication failed" };
      }
      req.session.user = user;
      return res.send(user);
    })
    .catch(err => next(err));
});

app.get("/api/sessions", (req, res, next) => {
  const user = req.session.user;
  if (user) {
    return res.send(user);
  }
  next({ status: 401, message: "user is not logged in" });
});

app.delete("/api/sessions", (req, res, next) => {
  req.session.destroy();
  res.status(204).send("user is now logged out");
});

app.get("/", (req, res, next) => {
  res.send("Welcome Home");
});

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .send(err.message || "an unexpected error has occured");
});
