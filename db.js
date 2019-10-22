const Sequelize = require("sequelize");
const { UUID, UUIDV4, STRING } = Sequelize;
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/postman_express_example",
  {
    logging: false
  }
);

const User = conn.define("user", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  username: {
    type: STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: STRING,
    allowNull: false
  }
});

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const users = [
    { name: "moe" },
    { name: "larry" },
    { name: "lucy" },
    { name: "ethyl" }
  ];
  await Promise.all(
    users.map(user =>
      User.create({
        username: `${user.name}@gmail.com`,
        password: user.name.toUpperCase()
      })
    )
  );
};

module.exports = {
  models: {
    User
  },
  syncAndSeed
};
