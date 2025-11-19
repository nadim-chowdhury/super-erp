"use client";

import { ChatMessage, ChatUser } from "@/lib/data/demoData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck, Download, Image as ImageIcon, File } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  sender: ChatUser | undefined;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

export function MessageBubble({
  message,
  sender,
  isOwn,
  showAvatar,
  showTimestamp,
}: MessageBubbleProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />;
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 group",
        isOwn && "flex-row-reverse"
      )}
    >
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {sender ? getInitials(sender.name) : "?"}
          </AvatarFallback>
        </Avatar>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[70%]",
          isOwn && "items-end"
        )}
      >
        {showTimestamp && (
          <span className="text-xs text-muted-foreground px-2">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
        )}

        <div
          className={cn(
            "rounded-lg px-4 py-2 break-words",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {message.type === "text" && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}

          {message.type === "file" && message.attachments && (
            <div className="space-y-2">
              {message.attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-background/20 rounded"
                >
                  <File className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs opacity-80">
                      {formatBytes(attachment.size)}
                    </p>
                  </div>
                  <Download className="h-4 w-4 shrink-0 opacity-60" />
                </div>
              ))}
              {message.content && message.content !== "File attachment" && (
                <p className="text-sm mt-2">{message.content}</p>
              )}
            </div>
          )}

          {message.type === "image" && message.attachments && (
            <div className="space-y-2">
              {message.attachments.map((attachment, idx) => (
                <div key={idx} className="rounded overflow-hidden">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-full h-auto max-h-64 object-cover"
                  />
                </div>
              ))}
              {message.content && message.content !== "Image" && (
                <p className="text-sm mt-2">{message.content}</p>
              )}
            </div>
          )}
        </div>

        {isOwn && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getStatusIcon()}
          </div>
        )}
      </div>
    </div>
  );
}

