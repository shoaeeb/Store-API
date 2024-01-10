require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const notFoundMiddeleware = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const productsRouter = require("./routes/products");
//middleware
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.send("<h1>Storee API</h1><a href='/api/v1/products'>products route</a>");
});

//products route
app.use("/api/v1/products", productsRouter);
app.use(notFoundMiddeleware);
app.use(errorMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    //connect to db
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is Listening to Port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};
start();
