import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./lib/db.js";

const PORT = process.env.PORT || 5004;

app.listen(PORT,() => {
  connectDB()
  console.log(`Express server running on http://localhost:${PORT}`);
});