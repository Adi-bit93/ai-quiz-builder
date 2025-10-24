import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
});

const loginUser = asyncHandler(async (req, res) => {
    const {email, password, username} = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or:[{username}, {email}]
    })

    if(!user){
        throw new ApiError(401, "User does not exist")
    }


    const ispasswordValid = await user.isPasswordCorrect(password)
    if(!ispasswordValid){
        throw new ApiError(401, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res 
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res 
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfully"))
})

const profile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if(!userId){
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if(!user){
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details fetched successfully"));
});

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

        const {accessToken, refreshToken: newrefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
        
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
    loginUser,
    logoutUser,
    profile,
    refreshAccessToken
}