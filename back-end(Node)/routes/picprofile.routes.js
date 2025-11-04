import { setupProfileUser, updateProfileUser} from "../controllers/profileuser.controller.js";
import { upload } from "../controllers/uploadprofileuser.controller.js";
import express from "express";

const router = express.Router();

router.post("/picprofile", upload.single("avatar"), setupProfileUser);
router.put("/picprofile/:userid", upload.single("avatar"), updateProfileUser);

export default router;
