import User from "../models/User.model.js";
import Vent from "../models/Vent.model.js";
import Reflection from "../models/Reflection.model.js";
import MessageVault from "../models/MessageVault.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
   } catch (error) {
      throw new ApiError(500, "Failed to generate tokens");
   }
};

const registerUser = asyncHandler(async (req, res) => {
   const { email, username, password } = req.body;

   if (!email || !username || !password) {
      throw new ApiError(400, "Please fill all the fields");
   }

   const existedUser = await User.findOne({
      $or: [{ email }, { username }],
   });

   if (existedUser) {
      throw new ApiError(409, "User already exists");
   }

   const user = await User.create({
      email,
      username: username.toLowerCase(),
      password,
   });

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
   );

   const cookieOptions = {
      httpOnly: true,
      secure: true,
   };

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   if (!createdUser) {
      throw new ApiError(500, "Failed to create user");
   }

   return res
      .status(200)
      .cookie("accessToken", accessToken, {
         ...cookieOptions,
         expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
         maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
         ...cookieOptions,
         expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
         maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json(
         new ApiResponse(
            200,
            {
               user: createdUser,
               accessToken,
               refreshToken,
            },
            "User registered successfully"
         )
      );
});

const loginUser = asyncHandler(async (req, res) => {
   const { email, username, password } = req.body;

   if ((!email && !username) || !password) {
      throw new ApiError(400, "Email or username and password are required");
   }

   const user = await User.findOne({
      $or: [{ email }, { username }],
   }).select("+password");

   if (!user) {
      throw new ApiError(404, "User not found");
   }

   const isPasswordValid = await user.isPasswordCorrect(password);

   if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
   );

   const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   const cookieOptions = {
      httpOnly: true,
      secure: true,
   };

   return res
      .status(200)
      .cookie("accessToken", accessToken, {
         ...cookieOptions,
         expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
         maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
         ...cookieOptions,
         expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
         maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json(
         new ApiResponse(
            200,
            {
               user: loggedInUser,
               accessToken,
               refreshToken,
            },
            "User logged in successfully"
         )
      );
});

const logoutUser = asyncHandler(async (req, res) => {
   // remove refresh token from db
   await User.findByIdAndUpdate(
      req.user._id,
      {
         // remove refresh token from db
         $unset: {
            refreshToken: "",
         },
      },
      {
         new: true,
      }
   );

   const cookieOptions = {
      httpOnly: true,
      secure: true,
   };

   return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

   if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token missing. Please login again.");
   }

   let decoded;
   try {
      decoded = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      );
   } catch (error) {
      throw new ApiError(
         401,
         "Invalid or expired refresh token. Please login again."
      );
   }

   const userId = decoded?._id;
   if (!userId) {
      throw new ApiError(401, "Invalid token payload. Please login again.");
   }

   const user = await User.findById(userId).select("+refreshToken");

   if (!user) {
      throw new ApiError(401, "User not found. Please login again.");
   }

   if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(403, "Refresh token mismatch. Please login again.");
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
   );

   user.refreshToken = refreshToken;
   await user.save({ validateBeforeSave: false });

   const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "none",
   };

   return res
      .status(200)
      .cookie("accessToken", accessToken, {
         ...cookieOptions,
         expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
         maxAge: 24 * 60 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
         ...cookieOptions,
         expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
         maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json(
         new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Access token refreshed successfully"
         )
      );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
   const { currentPassword, newPassword } = req.body;

   if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current and new passwords are required");
   }

   const user = await User.findById(req.user?._id);

   if (!user) {
      throw new ApiError(404, "User not found");
   }

   const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

   if (!isPasswordCorrect) {
      throw new ApiError(401, "Current password is incorrect");
   }

   user.password = newPassword;
   await user.save();

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
   let { email, username } = req.body;

   // Prevent empty string updates
   if (
      (!email || email.trim() === "") &&
      (!username || username.trim() === "")
   ) {
      throw new ApiError(
         400,
         "Please provide either email or username to update"
      );
   }

   if (username) {
      username = username.toLowerCase();
   }

   // Check if the new email or username is already taken by someone else
   const existingUser = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [email ? { email } : null, username ? { username } : null].filter(
         Boolean
      ),
   });

   if (existingUser) {
      throw new ApiError(409, "Email or username already in use");
   }

   const updateData = {};
   if (email) updateData.email = email;
   if (username) updateData.username = username;

   const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      {
         new: true,
         runValidators: true,
      }
   ).select("-password -refreshToken");

   if (!updatedUser) {
      throw new ApiError(404, "User not found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
   const userId = req.user._id;

   await User.findByIdAndDelete(userId);

   // Optionally delete user's content: Vents, Reflections, Messages
   await Promise.all([
      Vent.deleteMany({ user: userId }),
      Reflection.deleteMany({ user: userId }),
      MessageVault.deleteMany({ user: userId }),
   ]);

   return res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiResponse(200, {}, "User account deleted successfully"));
});

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateUserProfile,
   deleteAccount,
};
