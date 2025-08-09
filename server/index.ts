import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleRegister,
  handleMe,
  handleLogout,
  authenticateToken,
} from "./routes/auth";
import {
  handleGetTopics,
  handleGetTopic,
  handleCreateTopic,
  handleCreateComment,
  handleLikeTopic,
  handleLikeComment,
  handleDeleteTopic,
  handleDeleteComment,
  handleGetUserTopics,
} from "./routes/forum";
import { uploadMiddleware, handleUpload } from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Serve uploaded files
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "public", "uploads")),
  );

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.get("/api/auth/me", authenticateToken, handleMe);
  app.post("/api/auth/logout", authenticateToken, handleLogout);

  // Forum routes
  app.get("/api/topics", handleGetTopics);
  app.get("/api/topics/user", authenticateToken, handleGetUserTopics);
  app.get("/api/topics/:topicId", handleGetTopic);
  app.post("/api/topics", authenticateToken, handleCreateTopic);
  app.post(
    "/api/topics/:topicId/comments",
    authenticateToken,
    handleCreateComment,
  );
  app.post("/api/topics/:topicId/like", authenticateToken, handleLikeTopic);
  app.post(
    "/api/comments/:commentId/like",
    authenticateToken,
    handleLikeComment,
  );

  // Admin routes
  app.delete("/api/topics/:topicId", authenticateToken, handleDeleteTopic);
  app.delete(
    "/api/comments/:commentId",
    authenticateToken,
    handleDeleteComment,
  );

  // Upload route
  app.post("/api/upload", authenticateToken, uploadMiddleware, handleUpload);

  return app;
}
