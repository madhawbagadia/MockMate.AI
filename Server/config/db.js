import mongoose from "mongoose";

const database = async () => {
  await mongoose.connect(process.env.DB_CONNECT);
};

export default database;