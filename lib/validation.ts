import { z } from "zod";

export const roomSchema = z.object({
  ownerName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z0-9\s]+$/, "Invalid characters"),
});

export const messageSchema = z.object({
  content: z.string().max(1000, "Message too long"),
  userName: z.string().min(1, "Name required").max(50, "Name too long"),
  type: z.enum(["text", "image", "pdf", "file"]),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
});

export const joinRoomSchema = z.object({
  name: z.string().min(1, "Name required").max(50, "Name too long"),
  roomId: z
    .string()
    .min(1, "Room ID required")
    .regex(/^[a-zA-Z0-9]+$/, "Invalid room ID"),
});
