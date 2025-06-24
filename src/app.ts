import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api";
// Routes
import authRoutes from "./routes/auth.routes";
// import userRoutes from "./api/user/user.routes";

// Middleware
import errorHandler from "./middlewares/errorHandler";
import { connectMongo } from "./db/mongo";

const app: Application = express();
(async () => {
  await connectMongo();
})();

app.set("trust proxy", 1);

// All your actual API routes
app.use("/api", apiRoutes);


// Security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Gzip compression
app.use(compression());

// Parse JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Rate limiting (100 requests per 15 minutes)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Logging
const env = process.env.NODE_ENV || "development";
if (env === "production") {
  const accessLogStream = fs.createWriteStream(
    path.join(process.cwd(), "access.log"),
    { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
} else {
  app.use(morgan("dev"));
}

// Routes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ message: 'OK' });
});
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

// Error handler (should be last)
app.use(errorHandler);

export default app;