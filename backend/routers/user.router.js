const UserRouter = require("express").Router();

const {
  register,
  verifyOtp,
  login
} = require("../controllers/Usercontroller");

UserRouter.post(
  "/register",
  register,
);
UserRouter.post("/verify-otp",verifyOtp);
UserRouter.post("/login",login)





module.exports = UserRouter;
