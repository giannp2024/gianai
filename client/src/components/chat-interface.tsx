import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Bot, User, Bell, Sun, Clock } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useReminders } from "@/hooks/use-reminders";
import { format, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isLoading } = useChat();
  const { reminders } = useReminders();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    await sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Simulate voice recording - in real app this would use speech recognition
      setTimeout(() => {
        setIsRecording(false);
        setInputMessage("¿Puedes recordarme comprar leche mañana a las 9 AM?");
      }, 3000);
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return format(new Date(timestamp), "HH:mm", { locale: es });
  };

  const getReminderCard = (content: string) => {
    // Simple pattern matching for reminder-related responses
    if (content.toLowerCase().includes("recordatorio") || content.toLowerCase().includes("he creado")) {
      const latestReminder = reminders[reminders.length - 1];
      if (latestReminder) {
        return (
          <Card className="reminder-card mt-3 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium">Recordatorio</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isToday(new Date(latestReminder.datetime)) 
                  ? "Hoy" 
                  : isTomorrow(new Date(latestReminder.datetime))
                  ? "Mañana"
                  : format(new Date(latestReminder.datetime), "dd/MM", { locale: es })
                } {format(new Date(latestReminder.datetime), "HH:mm")}
              </span>
            </div>
            <p className="text-sm mt-1">{latestReminder.title}</p>
          </Card>
        );
      }
    }

    // Weather card for weather-related responses
    if (content.toLowerCase().includes("clima") || content.toLowerCase().includes("temperatura")) {
      return (
        <Card className="reminder-card mt-3 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Madrid</span>
            </div>
            <span className="text-lg font-semibold">22°C</span>
          </div>
          <p className="text-xs text-muted-foreground">Despejado • Máx: 28°C</p>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <Card className="chat-bubble-ai rounded-2xl rounded-tl-sm p-4 max-w-xs">
              <p className="text-sm">
                ¡Hola! Soy Gian AI, tu asistente personal. Puedes hablarme o escribirme para crear recordatorios, hacer búsquedas o enviar información a tu correo.
              </p>
            </Card>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start space-x-3 fade-in ${
              message.sender === "user" ? "justify-end" : ""
            }`}
          >
            {message.sender === "assistant" && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            
            <div className={`max-w-xs ${
              message.sender === "user" ? "order-first" : ""
            }`}>
              <Card className={`${
                message.sender === "user" 
                  ? "chat-bubble-user rounded-2xl rounded-tr-sm" 
                  : "chat-bubble-ai rounded-2xl rounded-tl-sm"
              } p-4`}>
                <p className={`text-sm ${
                  message.sender === "user" ? "text-primary-foreground" : ""
                }`}>
                  {message.content}
                </p>
              </Card>
              
              {/* Dynamic cards for AI responses */}
              {message.sender === "assistant" && getReminderCard(message.content)}
            </div>

            {message.sender === "user" && (
              <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-background" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3 slide-up">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <Card className="chat-bubble-ai rounded-2xl rounded-tl-sm p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-muted border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="bg-input text-foreground placeholder-muted-foreground rounded-2xl px-4 py-3 pr-12 border-0 focus:ring-2 focus:ring-primary"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary h-6 w-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Voice Button */}
          <Button
            size="icon"
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-full transition-all duration-200 ${
              isRecording 
                ? "voice-button-active" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Mic className="w-5 h-5 text-primary-foreground" />
            )}
          </Button>
        </div>
        
        {/* Voice Status Indicator */}
        {isRecording && (
          <div className="mt-2 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Escuchando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
