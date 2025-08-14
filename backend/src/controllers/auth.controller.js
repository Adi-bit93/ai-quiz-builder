import { User } from "../models/User.model";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken= user.generateRefreshToken();
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
        
       return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating token")
    }
}

const registerUser = asyncHandler(async (req, res) =>{
    const {email, password, username} = req.body;

    if([email, password, username].some((field) => field?.trim() ==="")){
        throw new ApiError(400, "All fields are required");
    }
    const existingUser = await User.findOne({
        $or: [{username}, {email} ]
    })

    if(existingUser){
        throw new ApiError(401, "User already exists")
    }

    const user = await User.create({
        email, 
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

})

const refreshAccessToken = asyncHandler(async(req, res) =>{
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingrefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        if(incomingrefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, newrefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
        
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


export {
    registerUser,
    refreshAccessToken
}