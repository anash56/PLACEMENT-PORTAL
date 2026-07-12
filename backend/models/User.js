import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        enum:["student","admin"],
        default:"student"
    },

    cgpa:{
        type:Number
    },

    branch:{
        type:String
    },

    graduationYear:{
        type:Number
    },

    skills:{
        type:[String],
        default:[]
    },

    contactNumber:{
        type:String
    },

    resumeUrl:{
        type:String
    },

    isProfileCompleted:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true
}
);

const User = mongoose.model("User",userSchema);

export default User;