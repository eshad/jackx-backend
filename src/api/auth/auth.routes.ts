import express from "express";
import { login, register } from "./auth.controller";
import { LoginSchema, RegisterSchema } from "./auth.schema";
import { validate } from "../../middlewares/validate";

const router = express.Router();

router.post("/login", validate({ body: LoginSchema }), login);
router.post("/register", validate({ body: RegisterSchema }), register);

export default router;