import { Router } from "express" ;
import { registerUser, loginUser, logoutUser, profile, refreshAccessToken } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";


const router  = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// secured routes
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, profile);
router.post("/refresh-token", refreshAccessToken);

export default router;