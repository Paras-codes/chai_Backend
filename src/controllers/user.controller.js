import { asyncHandler } from "../utils/assyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
const registerUser=asyncHandler(async(req,res)=>{
    //frontend se lelo 
    //validation check karlo 
    //validation of files upload 
    //no avatar te error else not needed coverimage
    //find if user exists with that username and email or not 
    //upload on cloudinary 
    //check karo ki upload hua bhi h cloudinary p ya nii
    //no avatar throw error
    //use save in db aur response m user bina password k bhejdo   
    
    const {fullname,email,username,password}=req.body
    if(
        [fullname,email,username,password].some((fields)=>
            fields?.trim()==="")
    ){

    throw new ApiError(400,"All fields are required");

    }

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with this email or username already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImagePath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    let coverImage;
    if(coverImagePath){
        coverImage=await uploadOnCloudinary(coverImagePath);
    }

    if(!avatar){
        throw new ApiError(400,"avatar file is not uploaded");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

export{
    registerUser,
}