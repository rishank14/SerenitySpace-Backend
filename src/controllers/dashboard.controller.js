import asyncHandler from "../utils/asyncHandler.js";
import Vent from "../models/Vent.model.js";
import Reflection from "../models/Reflection.model.js";
import MessageVault from "../models/MessageVault.model.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getDashboardData = asyncHandler(async (req, res) => {
   const userId = req?.user?._id;

   const [vents, reflections, deliveredMessages, upcomingMessages] =
      await Promise.all([
         Vent.find({ user: userId }).sort({ createdAt: -1 }),
         Reflection.find({ user: userId }).sort({ createdAt: -1 }),
         MessageVault.find({ user: userId, delivered: true }).sort({
            deliverAt: -1,
         }),
         MessageVault.find({ user: userId, delivered: false }).sort({
            deliverAt: 1,
         }),
      ]);

   return res.status(200).json(
      new ApiResponse(
         200,
         {
            vents,
            reflections,
            messageVault: {
               delivered: deliveredMessages,
               upcoming: upcomingMessages,
            },
         },
         "Dashboard data fetched successfully"
      )
   );
});
