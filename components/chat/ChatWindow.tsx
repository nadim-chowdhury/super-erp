"use client";

import { useEffect, useRef, useState } from "react";
import { Chat, ChatMessage, ChatUser } from "@/lib/data/demoData";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Users, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWindowProps {
  chat: Chat | null;
  messages: ChatMessage[];
  users: ChatUser[];
  currentUserId: string;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  typingUsers: string[];
}

export function ChatWindow({
  chat,
  messages,
  users,
  currentUserId,
  onSendMessage,
  onTyping,
  typingUsers,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change or chat changes
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    };

    // Use setTimeout to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, chat]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30 h-full">
        <div className="text-center">
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  const getChatUser = (userId: string): ChatUser | undefined => {
    return users.find((u) => u.id === userId);
  };

  const getChatName = (): string => {
    if (chat.type === "group") return chat.name;
    const otherUser = users.find(
      (u) => chat.participants.includes(u.id) && u.id !== currentUserId
    );
    return otherUser?.name || chat.name;
  };

  const getChatAvatar = (): string | undefined => {
    if (chat.type === "group") return undefined;
    const otherUser = users.find(
      (u) => chat.participants.includes(u.id) && u.id !== currentUserId
    );
    return otherUser?.avatar || chat.avatar;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: Record<string, ChatMessage[]> = {};
    messages.forEach((msg) => {
      const date = format(new Date(msg.createdAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today";
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  const shouldShowAvatar = (
    currentMsg: ChatMessage,
    prevMsg: ChatMessage | null
  ): boolean => {
    if (!prevMsg) return true;
    if (currentMsg.senderId !== prevMsg.senderId) return true;
    const timeDiff =
      new Date(currentMsg.createdAt).getTime() -
      new Date(prevMsg.createdAt).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  const shouldShowTimestamp = (
    currentMsg: ChatMessage,
    nextMsg: ChatMessage | null
  ): boolean => {
    if (!nextMsg) return true;
    const timeDiff =
      new Date(nextMsg.createdAt).getTime() -
      new Date(currentMsg.createdAt).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {chat.type === "group" ? (
                <Users className="h-5 w-5" />
              ) : (
                getInitials(getChatName())
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{getChatName()}</h3>
            {chat.type === "group" && (
              <p className="text-xs text-muted-foreground">
                {chat.participants.length} participants
              </p>
            )}
            {typingUsers.length > 0 && (
              <p className="text-xs text-muted-foreground italic">
                {typingUsers
                  .map((id) => getChatUser(id)?.name)
                  .filter(Boolean)
                  .join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="p-4 space-y-4 h-[calc(100vh-186px)] overflow-y-auto"
      >
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="flex items-center justify-center my-4">
              <Badge variant="secondary" className="text-xs">
                {formatDateHeader(date)}
              </Badge>
            </div>
            {dateMessages.map((message, idx) => {
              const sender = getChatUser(message.senderId);
              const isOwn = message.senderId === currentUserId;
              const prevMessage = idx > 0 ? dateMessages[idx - 1] : null;
              const nextMessage =
                idx < dateMessages.length - 1 ? dateMessages[idx + 1] : null;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  sender={sender}
                  isOwn={isOwn}
                  showAvatar={shouldShowAvatar(message, prevMessage)}
                  showTimestamp={shouldShowTimestamp(message, nextMessage)}
                />
              );
            })}
          </div>
        ))}
          {messages.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} onTyping={onTyping} />
    </div>
  );
}
