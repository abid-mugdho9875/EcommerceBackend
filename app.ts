import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import express from "express";
import "express-async-errors";
// import fileUpload from "express-fileupload";
import morgan from "morgan";

import connectDB from "./db/connect";

import authRouter from "./routes/AuthRoutes";
import orderRouter from "./routes/OrderRoutes";
import productRouter from "./routes/ProductRoutes";
import reviewRouter from "./routes/ReviewRoutes";
import userRouter from "./routes/UserRoutes";

import errorHandlerMiddleware from "./middleware/ErrorHandler";
import notFoundMiddleware from "./middleware/NotFound";

const app = express();

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static("./public"));
// app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("ecommerce");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI!);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
