"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setUsers,
  setChats,
  setMessages,
  addMessage,
  setSelectedChat,
  setTyping,
  setSearchQuery,
  setCurrentUserId,
  updateMessageStatus,
} from "@/lib/store/slices/chatSlice";
import {
  generateChatUsers,
  generateChats,
  generateMessages,
  ChatMessage,
} from "@/lib/data/demoData";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Card } from "@/components/ui/card";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const {
    users,
    chats,
    messages,
    selectedChatId,
    typingUsers,
    searchQuery,
    currentUserId,
  } = useAppSelector((state) => state.chat);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initialize demo data
    const demoUsers = generateChatUsers(15);
    const demoChats = generateChats(demoUsers, 20);
    const currentUser = demoUsers[0];

    dispatch(setUsers(demoUsers));
    dispatch(setChats(demoChats));
    dispatch(setCurrentUserId(currentUser.id));

    // Generate messages for each chat
    demoChats.forEach((chat) => {
      const chatMessages = generateMessages(chat.id, chat.participants, 30);
      dispatch(setMessages({ chatId: chat.id, messages: chatMessages }));
    });

    // Auto-select first chat
    if (demoChats.length > 0) {
      dispatch(setSelectedChat(demoChats[0].id));
    }
  }, [dispatch]);

  // Simulate real-time messages
  useEffect(() => {
    if (chats.length === 0) return;

    const interval = setInterval(() => {
      // Randomly send a message to a random chat
      if (Math.random() > 0.7) {
        const randomChat = chats[Math.floor(Math.random() * chats.length)];
        const randomSender =
          randomChat.participants[
            Math.floor(Math.random() * randomChat.participants.length)
          ];

        if (randomSender !== currentUserId) {
          const newMessage: ChatMessage = {
            id: crypto.randomUUID(),
            chatId: randomChat.id,
            senderId: randomSender,
            content: [
              "Hey, how are you?",
              "Can we schedule a meeting?",
              "I'll send you the report shortly",
              "Thanks for your help!",
              "Let me know if you need anything",
            ][Math.floor(Math.random() * 5)],
            type: "text",
            status: "sent",
            createdAt: new Date().toISOString(),
          };

          dispatch(addMessage(newMessage));

          // Simulate message status updates
          setTimeout(() => {
            dispatch(
              updateMessageStatus({
                chatId: randomChat.id,
                messageId: newMessage.id,
                status: "delivered",
              })
            );
          }, 500);

          if (randomChat.id === selectedChatId) {
            setTimeout(() => {
              dispatch(
                updateMessageStatus({
                  chatId: randomChat.id,
                  messageId: newMessage.id,
                  status: "read",
                })
              );
            }, 1000);
          } else {
            // Increment unread count if not selected
            // This would be handled by the slice, but we can add it here too
          }
        }
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [chats, currentUserId, selectedChatId, dispatch]);

  const handleSelectChat = (chatId: string) => {
    dispatch(setSelectedChat(chatId));
  };

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!selectedChatId) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      chatId: selectedChatId,
      senderId: currentUserId,
      content: content || (attachments ? "File attachment" : ""),
      type: attachments
        ? attachments[0].type.startsWith("image/")
          ? "image"
          : "file"
        : "text",
      status: "sending",
      attachments: attachments?.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
      })),
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessage(newMessage));

    // Simulate sending status updates
    setTimeout(() => {
      dispatch(
        updateMessageStatus({
          chatId: selectedChatId,
          messageId: newMessage.id,
          status: "sent",
        })
      );
    }, 300);

    setTimeout(() => {
      dispatch(
        updateMessageStatus({
          chatId: selectedChatId,
          messageId: newMessage.id,
          status: "delivered",
        })
      );
    }, 800);

    // Simulate read status if chat is selected
    setTimeout(() => {
      dispatch(
        updateMessageStatus({
          chatId: selectedChatId,
          messageId: newMessage.id,
          status: "read",
        })
      );
    }, 1500);
  };

  const handleTyping = (typing: boolean) => {
    if (!selectedChatId) return;
    setIsTyping(typing);
    dispatch(
      setTyping({
        chatId: selectedChatId,
        userId: currentUserId,
        isTyping: typing,
      })
    );

    // Auto-stop typing after 3 seconds
    if (typing) {
      setTimeout(() => {
        setIsTyping(false);
        dispatch(
          setTyping({
            chatId: selectedChatId,
            userId: currentUserId,
            isTyping: false,
          })
        );
      }, 3000);
    }
  };

  // Sort chats by last message time (most recent first)
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
      );
    });
  }, [chats]);

  const selectedChat = sortedChats.find((c) => c.id === selectedChatId);
  const selectedChatMessages = selectedChatId
    ? messages[selectedChatId] || []
    : [];
  const selectedChatTypingUsers = selectedChatId
    ? typingUsers[selectedChatId] || []
    : [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
            <p className="text-muted-foreground">
              Real-time messaging and communication
            </p>
          </div>
        </div>

        <div className="h-[calc(100vh-198px)]">
          <Card className="h-full py-0">
            <div className="flex h-full">
              <div className="w-80 shrink-0">
                <ChatList
                  chats={sortedChats}
                  users={users}
                  selectedChatId={selectedChatId}
                  searchQuery={searchQuery}
                  onSelectChat={handleSelectChat}
                  onSearchChange={(query) => dispatch(setSearchQuery(query))}
                  currentUserId={currentUserId}
                />
              </div>
              <div className="flex-1">
                <ChatWindow
                  chat={selectedChat || null}
                  messages={selectedChatMessages}
                  users={users}
                  currentUserId={currentUserId}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  typingUsers={selectedChatTypingUsers}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
