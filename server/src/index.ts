import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import { studentRouter } from "./routes/studentRoutes.js";
import { settingsRouter } from "./routes/settingsRoute.js";
configDotenv();
const port = process.env.port || 3000;
const app = express();
app.use(cors());
app.use(express.json());


app.get('/health', async (req, res) => {
  res.send(`<h1> Hello and Welcome to Port ${port}! i hope backend APIs are running all good :)</h1>`);
})

app.use("/api/student", studentRouter);
app.use("/api/settings", settingsRouter);


mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(3000, () => {
      console.log(`server is running on port ${port}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));



