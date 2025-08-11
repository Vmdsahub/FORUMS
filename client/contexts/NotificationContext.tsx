import React, { createContext, useContext, useState, ReactNode } from "react";

interface Notification {
  id: string;
  message: string;
  time: string;
  type?: 'badge' | 'quote' | 'general';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'badge' | 'quote' | 'general') => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'badge' | 'quote' | 'general' = 'general') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification, 
        clearNotifications 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
