import mongoose from 'mongoose';



const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim: true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        password:{
            type:String,
            required:[true, 'password is required']

        }
    },
{timestamps})

export const User = mongoose.model("User", userSchema)