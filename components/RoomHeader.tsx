import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Room } from "@/lib/types";

interface RoomHeaderProps {
  room: Room;
}

export default function RoomHeader({ room }: RoomHeaderProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now();
      const expiresAt = room.createdAt + 24 * 60 * 60 * 1000;
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [room.createdAt]);

  const copyRoomUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const deleteRoom = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this room? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Room deleted successfully");
        window.location.href = "/";
      } else {
        const error = await response.json();
        alert(`Failed to delete room: ${error.error}`);
      }
    } catch (err) {
      console.error("Failed to delete room:", err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className=" py-4 shadow-sm"
    >
      <div className="max-w-7xl px-4 mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Room {room.id}
            </h1>
            <p className="text-sm text-gray-600">Expires in {timeLeft}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={copyRoomUrl}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            aria-label="Copy room URL to clipboard"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>{copied ? "Copied!" : "Share"}</span>
          </motion.button>
          <motion.button
            onClick={deleteRoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            aria-label="Delete this room permanently"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Delete</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
