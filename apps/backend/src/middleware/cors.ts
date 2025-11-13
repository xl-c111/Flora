import cors from "cors";

export const corsMiddleware = cors({
  origin: ["http://localhost:5173"], // frontend addresses
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});
