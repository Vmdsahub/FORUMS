import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleRegister, handleMe, handleLogout, authenticateToken } from "./routes/auth";
import {
  handleGetTopics,
  handleGetTopic,
  handleCreateTopic,
  handleCreateComment,
  handleLikeTopic,
  handleLikeComment
} from "./routes/forum";
import { uploadMiddleware, handleUpload } from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
  app.get("/api/topics/:topicId", handleGetTopic);
  app.post("/api/topics", authenticateToken, handleCreateTopic);
  app.post("/api/topics/:topicId/comments", authenticateToken, handleCreateComment);
  app.post("/api/topics/:topicId/like", authenticateToken, handleLikeTopic);
  app.post("/api/comments/:commentId/like", authenticateToken, handleLikeComment);

  return app;
}
