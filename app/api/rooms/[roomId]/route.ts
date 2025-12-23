import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  try {
    console.log(`🔍 Fetching room: ${roomId}`);

    // Get the room data with error handling
    const room = await storage.getRoom(roomId);

    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      return NextResponse.json(
        { error: "Room not found or has expired" },
        { status: 404 }
      );
    }

    // Validate room data structure
    if (!room.id || !room.createdAt) {
      console.error(`❌ Room ${roomId} has invalid data structure:`, room);
      return NextResponse.json(
        { error: "Room data is corrupted" },
        { status: 500 }
      );
    }

    // Check if room has expired (24 hours)
    const now = Date.now();
    const expireTime = 24 * 60 * 60 * 1000; // 24 hours

    if (now - room.createdAt > expireTime) {
      console.log(`⏰ Room ${roomId} has expired`);
      return NextResponse.json({ error: "Room has expired" }, { status: 404 });
    }

    console.log(`✅ Room ${roomId} retrieved successfully`);
    return NextResponse.json(room);
  } catch (error) {
    console.error(`❌ Failed to get room ${roomId}:`, error);
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  try {
    console.log(`🗑️ Deleting room: ${roomId}`);

    const deleted = await storage.deleteRoom(roomId);

    if (!deleted) {
      console.log(`❌ Room ${roomId} not found for deletion`);
      return NextResponse.json(
        { error: "Room not found or already deleted" },
        { status: 404 }
      );
    }

    console.log(`✅ Room ${roomId} deleted successfully`);
    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(`❌ Failed to delete room ${roomId}:`, error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
