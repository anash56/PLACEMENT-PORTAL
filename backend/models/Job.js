import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true
    },

    company:{
        type:String,
        required:true
    },

    location:{
        type:String,
        required:true
    },

    salary:{
        type:Number,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    minCgpa: {
        type: Number,
        default: 0
    },

    allowedBranches: {
        type: [String],
        default: []
    },

    deadline: {
        type: Date,
        default: null
    }
},
{
    timestamps:true
}
);

jobSchema.index({ createdBy: 1 });
jobSchema.index({ salary: -1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ title: "text", company: "text", description: "text" });


const Job = mongoose.model("Job",jobSchema);

export default Job;