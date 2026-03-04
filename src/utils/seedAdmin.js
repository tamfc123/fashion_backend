import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await User.findOne({ email: "admin@gmail.com" });

        if (existingAdmin) {
            console.log("Admin already exists");
        } else {
            const hashedPassword = await bcrypt.hash("123456", 10);
            await User.create({
                name: "Admin",
                email: "admin@gmail.com",
                password: hashedPassword,
                role: "ADMIN"
            });
            console.log("Admin user created");
        }
    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

seedAdmin();
