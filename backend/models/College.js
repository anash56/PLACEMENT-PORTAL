import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 180 },
    nameNormalized: { type: String, required: true, unique: true, index: true },
    contactPerson: { type: String, required: true, trim: true, maxlength: 120 },
    contactDesignation: { type: String, trim: true, maxlength: 120, default: "" },
    contactEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    contactPhone: { type: String, required: true, trim: true, maxlength: 30 },
    website: { type: String, trim: true, maxlength: 300, default: "" },
    address: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending", index: true },
    rejectionReason: { type: String, trim: true, maxlength: 1000, default: "" },
    reviewReason: { type: String, trim: true, maxlength: 1000, default: "" },
    approvedAt: { type: Date, default: null },
    suspendedAt: { type: Date, default: null },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

collegeSchema.pre("validate", function normalizeCollegeName() {
    if (this.name) this.nameNormalized = this.name.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
});

collegeSchema.index({ status: 1, nameNormalized: 1 });
collegeSchema.index({ contactEmail: 1 });

export default mongoose.models.College || mongoose.model("College", collegeSchema);
