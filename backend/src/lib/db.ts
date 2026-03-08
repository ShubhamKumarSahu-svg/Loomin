import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const mongoDbName = process.env.MONGODB_DB_NAME ?? "social_publisher";

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri, { dbName: mongoDbName });

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("MongoDB connection is established but database handle is unavailable");
    }
    const brandsCollection = db.collection("brands");
    const indexes = await brandsCollection.indexes();
    const hasLegacyNameIndex = indexes.some((idx) => idx.name === "name_1");
    const hasLegacyBrandNameIndex = indexes.some((idx) => idx.name === "brand_name_1");
    const hasScopedBrandIndex = indexes.some((idx) => idx.name === "userId_1_brand_name_1");

    if (hasLegacyNameIndex) {
      await brandsCollection.dropIndex("name_1");
      console.log("Dropped legacy brands index: name_1");
    }

    if (hasLegacyBrandNameIndex) {
      await brandsCollection.dropIndex("brand_name_1");
      console.log("Dropped legacy brands index: brand_name_1");
    }

    if (!hasScopedBrandIndex) {
      await brandsCollection.createIndex(
        { userId: 1, brand_name: 1 },
        { unique: true, name: "userId_1_brand_name_1" }
      );
      console.log("Created scoped brands index: userId_1_brand_name_1");
    }

    const socialAccountsCollection = db.collection("social_accounts");
    const socialIndexes = await socialAccountsCollection.indexes();
    const hasLegacySocialIndex = socialIndexes.some(
      (idx) => idx.name === "user_1_brand_1_platform_1"
    );
    const hasCurrentSocialIndex = socialIndexes.some(
      (idx) => idx.name === "user_id_1_platform_1"
    );

    if (hasLegacySocialIndex) {
      await socialAccountsCollection.dropIndex("user_1_brand_1_platform_1");
      console.log("Dropped legacy social_accounts index: user_1_brand_1_platform_1");
    }

    if (!hasCurrentSocialIndex) {
      await socialAccountsCollection.createIndex(
        { user_id: 1, platform: 1 },
        { unique: true, name: "user_id_1_platform_1" }
      );
      console.log("Created social_accounts index: user_id_1_platform_1");
    }

    console.log(`Connected to MongoDB database: ${mongoDbName}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
