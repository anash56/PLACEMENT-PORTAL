import "dotenv/config";
import mongoose from "mongoose";
import College from "../models/College.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const main = async () => {
    if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed development data when NODE_ENV=production.");
    if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI to your disposable development/test database.");
    const name = String(process.env.DEFAULT_COLLEGE_NAME || "Demo College").trim().replace(/\s+/g, " ");
    const normalized = name.normalize("NFKC").toLocaleLowerCase("en");
    await mongoose.connect(process.env.MONGO_URI);
    try {
        let college = await College.findOne({ nameNormalized: normalized });
        if (!college) {
            college = await College.create({
                name, nameNormalized: normalized,
                contactPerson: "Development Test Contact",
                contactDesignation: "Placement Coordinator",
                contactEmail: String(process.env.DEFAULT_COLLEGE_CONTACT_EMAIL || "college-admin@example.test").trim().toLowerCase(),
                contactPhone: "0000000000", address: "Development test institution",
                status: "approved", approvedAt: new Date(), reviewReason: "Development seed only"
            });
            console.log(`Created approved development college: ${college.name}`);
        } else {
            console.log(`Using existing college record: ${college.name} (status=${college.status}). Existing status was not changed.`);
        }
        const students = await User.updateMany({ role: "student", college: null }, { $set: { college: college._id, verificationStatus: "pending" } });
        const jobs = await Job.updateMany({ college: null }, { $set: { college: college._id } });
        console.log(`Associated ${students.modifiedCount ?? 0} existing student test accounts with the college; students remain pending verification.`);
        console.log(`Associated ${jobs.modifiedCount ?? 0} legacy job records with the college.`);
        console.log("No administrator accounts were promoted and no records were deleted.");
    } finally { await mongoose.disconnect(); }
};
main().catch(error => { console.error(error.message); process.exitCode = 1; });
