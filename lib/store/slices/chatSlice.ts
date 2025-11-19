import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chat, ChatMessage, ChatUser } from "@/lib/data/demoData";

interface ChatState {
  users: ChatUser[];
  chats: Chat[];
  messages: Record<string, ChatMessage[]>; // chatId -> messages
  selectedChatId: string | null;
  typingUsers: Record<string, string[]>; // chatId -> userIds
  searchQuery: string;
  currentUserId: string; // Current logged-in user
}

const initialState: ChatState = {
  users: [],
  chats: [],
  messages: {},
  selectedChatId: null,
  typingUsers: {},
  searchQuery: "",
  currentUserId: "",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<ChatUser[]>) => {
      state.users = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>
    ) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { chatId, senderId } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(action.payload);

      // Update chat's last message
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.lastMessage = {
          content: action.payload.content,
          senderId: action.payload.senderId,
          createdAt: action.payload.createdAt,
        };
        chat.updatedAt = action.payload.createdAt;

        // Increment unread count if message is from another user and chat is not selected
        if (
          senderId !== state.currentUserId &&
          state.selectedChatId !== chatId
        ) {
          chat.unreadCount += 1;
        }
      }
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        status: ChatMessage["status"];
      }>
    ) => {
      const { chatId, messageId, status } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    setSelectedChat: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
      // Mark messages as read when selecting a chat
      if (action.payload) {
        const messages = state.messages[action.payload];
        if (messages) {
          messages.forEach((msg) => {
            if (msg.status !== "read" && msg.senderId !== state.currentUserId) {
              msg.status = "read";
            }
          });
        }
        // Reset unread count
        const chat = state.chats.find((c) => c.id === action.payload);
        if (chat) {
          chat.unreadCount = 0;
        }
      }
    },
    setTyping: (
      state,
      action: PayloadAction<{ chatId: string; userId: string; isTyping: boolean }>
    ) => {
      const { chatId, userId, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[chatId].includes(userId)) {
          state.typingUsers[chatId].push(userId);
        }
      } else {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(
          (id) => id !== userId
        );
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentUserId: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload;
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) {
        chat.unreadCount += 1;
      }
    },
  },
});

export const {
  setUsers,
  setChats,
  setMessages,
  addMessage,
  updateMessageStatus,
  setSelectedChat,
  setTyping,
  setSearchQuery,
  setCurrentUserId,
  incrementUnreadCount,
} = chatSlice.actions;
export default chatSlice.reducer;

