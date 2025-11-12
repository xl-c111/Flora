import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    "http://localhost:5173", // Local development
    "https://dzmu16crq41il.cloudfront.net", // Production CloudFront
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});
