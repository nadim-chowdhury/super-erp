"use client";

import { useMemo, useEffect, useRef } from "react";
import { Chat, ChatUser } from "@/lib/data/demoData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { Search, Users } from "lucide-react";

interface ChatListProps {
  chats: Chat[];
  users: ChatUser[];
  selectedChatId: string | null;
  searchQuery: string;
  onSelectChat: (chatId: string) => void;
  onSearchChange: (query: string) => void;
  currentUserId: string;
}

export function ChatList({
  chats,
  users,
  selectedChatId,
  searchQuery,
  onSelectChat,
  onSearchChange,
  currentUserId,
}: ChatListProps) {
  const chatListRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<HTMLDivElement>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const chatUser = users.find(
        (u) => chat.participants.includes(u.id) && u.id !== currentUserId
      );
      return (
        chat.name.toLowerCase().includes(query) ||
        chat.lastMessage?.content.toLowerCase().includes(query) ||
        chatUser?.name.toLowerCase().includes(query)
      );
    });
  }, [chats, searchQuery, users, currentUserId]);

  // Scroll to selected chat
  useEffect(() => {
    if (selectedChatRef.current && selectedChatId) {
      selectedChatRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedChatId]);

  const getChatUser = (chat: Chat): ChatUser | undefined => {
    if (chat.type === "group") return undefined;
    return users.find(
      (u) => chat.participants.includes(u.id) && u.id !== currentUserId
    );
  };

  const getChatAvatar = (chat: Chat): string | undefined => {
    if (chat.type === "group") return undefined;
    const user = getChatUser(chat);
    return user?.avatar || chat.avatar;
  };

  const getChatName = (chat: Chat): string => {
    if (chat.type === "group") return chat.name;
    const user = getChatUser(chat);
    return user?.name || chat.name;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return format(date, "HH:mm");
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return format(date, "EEE");
    } else {
      return format(date, "MMM d");
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/30">
      <div className="p-[18px] border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div
        ref={chatListRef}
        className="p-2 h-[calc(100vh-186px)] overflow-y-auto"
      >
        {filteredChats.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {searchQuery ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const chatUser = getChatUser(chat);
            const isSelected = selectedChatId === chat.id;
            const lastMessageSender = users.find(
              (u) => u.id === chat.lastMessage?.senderId
            );

            return (
              <div
                key={chat.id}
                ref={isSelected ? selectedChatRef : null}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                  isSelected && "bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {chat.type === "group" ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        getInitials(getChatName(chat))
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {chatUser?.status === "online" && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {getChatName(chat)}
                    </h4>
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatLastMessageTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      {chat.lastMessage ? (
                        <>
                          {lastMessageSender?.id === currentUserId && (
                            <span className="mr-1">You: </span>
                          )}
                          {chat.lastMessage.content}
                        </>
                      ) : (
                        "No messages yet"
                      )}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="h-5 min-w-5 px-1.5 text-xs shrink-0"
                      >
                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
