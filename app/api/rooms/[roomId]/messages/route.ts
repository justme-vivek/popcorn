import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { generateId, generateUserId } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { messageSchema } from "@/lib/validation";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  try {
    console.log(`📨 Fetching messages for room: ${roomId}`);

    // Check if room exists first
    const roomExists = await storage.roomExists(roomId);
    console.log(`🔍 Room ${roomId} exists: ${roomExists}`);

    if (!roomExists) {
      console.log(`❌ Room ${roomId} not found`);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Get messages
    const messages = await storage.getMessages(roomId);
    console.log(`✅ Retrieved ${messages.length} messages for room ${roomId}`);

    // Ensure we always return an array
    const validMessages = Array.isArray(messages) ? messages : [];

    // Validate message structure
    const sanitizedMessages = validMessages.filter((msg) => {
      return (
        msg &&
        typeof msg === "object" &&
        msg.id &&
        msg.roomId &&
        msg.userId &&
        msg.content &&
        msg.type &&
        typeof msg.createdAt === "number"
      );
    });

    console.log(`✅ Returning ${sanitizedMessages.length} valid messages`);
    return NextResponse.json(sanitizedMessages, {
      headers: {
        "Cache-Control": "private, max-age=5", // Cache for 5 seconds
      },
    });
  } catch (error) {
    console.error(`❌ Failed to get messages for room ${roomId}:`, error);
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  try {
    console.log(`📝 Posting message to room: ${roomId}`);

    // Check if room exists
    const roomExists = await storage.roomExists(roomId);
    if (!roomExists) {
      console.log(`❌ Room ${roomId} not found`);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    // File validation is now handled in the upload route

    const {
      content,
      type = "text",
      fileName,
      fileSize,
      fileType,
      userName = "Anonymous",
    } = validatedData;

    const messageId = generateId();
    const userId = generateUserId();

    const message: Message = {
      id: messageId,
      roomId: roomId,
      userId,
      userName,
      content,
      type,
      fileName,
      fileSize,
      fileType,
      createdAt: Date.now(),
    };

    console.log(`💾 Storing message ${messageId} in room ${roomId}`);
    await storage.addMessage(roomId, message);
    console.log(`✅ Message stored successfully`);

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error(`❌ Failed to create message for room ${roomId}:`, error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
