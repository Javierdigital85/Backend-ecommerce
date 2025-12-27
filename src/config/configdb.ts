import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const dbURI = (process.env.MONGO_DB_URI ?? "")
      .replace("<db_username>", process.env.MONGO_DB_USER ?? "")
      .replace("<db_password>", process.env.MONGO_DB_PASSWORD ?? "")
      .replace("<db_name>", process.env.MONGO_DB_NAME ?? "");
    console.log(dbURI);

    await mongoose.connect(dbURI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.log("Error al conerse a MongoDB", error);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Base de datos MongoDB desconectada");
  } catch (error) {
    console.log("Error al desconectar desde MongoDB", error);
  }
};
