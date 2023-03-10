const express = require("express");
const mongoose = require("mongoose");

const session = require("express-session");
const redis = require("redis");
let RedisStore = require("connect-redis")(session);

const cors = require("cors");

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  SESSION_SECRET,
  REDIS_PORT,
  REDIS_URL,
} = require("./config/config");
const bodyParser = require("body-parser");

let redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT,
  },
});

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const connectWithRetry = () => {
  mongoose
    .connect(
      `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    )
    .then(() => console.log("Successfully connected to DB"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

redisClient.connect().catch(console.error);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({}));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialize: false,
      httpOnly: true,
      maxAge: 600000,
    },
  })
);

app.get("/", (req, res, next) => {
  res.status(200).json({
    message: "success",
  });
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
const port = process.env.PORT || 2000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
