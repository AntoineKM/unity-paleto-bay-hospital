import dotenv from "dotenv-flow";

dotenv.config({
  silent: true,
});

export const databaseUri = process.env.MONGODB_URI || "";
