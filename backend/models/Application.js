import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
{
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true
    },

    status:{
        type:String,
        enum:["Pending", "Test Scheduled", "Interview Scheduled", "Shortlisted", "Offered", "Rejected"],
        default:"Pending"
    }
},
{
    timestamps:true
}
);

applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1 });

const Application = mongoose.model(
    "Application",
    applicationSchema
);

export default Application;