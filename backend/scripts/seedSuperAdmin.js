import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const main = async () => {
    const { MONGO_URI, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;
    if (!MONGO_URI || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) throw new Error("Set MONGO_URI, SUPER_ADMIN_EMAIL, and SUPER_ADMIN_PASSWORD before running this script.");
    if (SUPER_ADMIN_PASSWORD.length < 12 || !/[A-Z]/.test(SUPER_ADMIN_PASSWORD) || !/[a-z]/.test(SUPER_ADMIN_PASSWORD) || !/\d/.test(SUPER_ADMIN_PASSWORD) || !/[^A-Za-z0-9]/.test(SUPER_ADMIN_PASSWORD)) throw new Error("SUPER_ADMIN_PASSWORD must be at least 12 characters with uppercase, lowercase, number, and special character.");
    await mongoose.connect(MONGO_URI);
    try {
        const existingSuperAdmin = await User.findOne({ role: "super_admin" }).lean();
        if (existingSuperAdmin) throw new Error("A Super Admin already exists. Refusing to create or modify another account.");
        const email = SUPER_ADMIN_EMAIL.trim().toLowerCase();
        if (await User.findOne({ email }).lean()) throw new Error("SUPER_ADMIN_EMAIL already belongs to an account; refusing to promote or overwrite it.");
        await User.create({ name: "Platform Super Admin", email, password: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12), role: "super_admin", verificationStatus: "verified" });
        console.log("Initial Super Admin created. Password was not logged.");
    } finally { await mongoose.disconnect(); }
};
main().catch(error => { console.error(error.message); process.exitCode = 1; });
