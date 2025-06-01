// This file is for any client-side OpenAI utilities if needed
// The main OpenAI integration is handled on the server-side for security

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  hasReminder?: boolean;
  hasWeather?: boolean;
  hasEmail?: boolean;
}

// Utility functions for parsing AI responses
export function parseAIResponse(content: string): AIResponse {
  const hasReminder = content.toLowerCase().includes("recordatorio") || 
                     content.toLowerCase().includes("he creado") ||
                     content.toLowerCase().includes("reminder");
  
  const hasWeather = content.toLowerCase().includes("clima") || 
                    content.toLowerCase().includes("temperatura") ||
                    content.toLowerCase().includes("weather");
  
  const hasEmail = content.toLowerCase().includes("correo") || 
                  content.toLowerCase().includes("email") ||
                  content.toLowerCase().includes("enviar");

  return {
    content,
    hasReminder,
    hasWeather,
    hasEmail
  };
}

// Extract reminder details from user message
export function extractReminderFromMessage(message: string): {
  title?: string;
  datetime?: Date;
} | null {
  const reminderKeywords = ["recordar", "recuerda", "recordatorio"];
  const hasReminderKeyword = reminderKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );

  if (!hasReminderKeyword) return null;

  // Simple extraction logic - in a real app this would be more sophisticated
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/,
    /(\d{1,2})\s*(AM|PM|am|pm)/,
    /(mañana|tomorrow)/i,
    /(hoy|today)/i,
  ];

  let datetime: Date | undefined;
  let title: string | undefined;

  // Extract time
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      const now = new Date();
      if (match[0].toLowerCase().includes("mañana") || match[0].toLowerCase().includes("tomorrow")) {
        datetime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      } else {
        datetime = new Date();
      }
      
      if (match[1] && match[2]) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        datetime.setHours(hours, minutes, 0, 0);
      }
      break;
    }
  }

  // Extract title (simplified)
  const words = message.split(" ");
  const reminderIndex = words.findIndex(word => 
    reminderKeywords.some(keyword => word.toLowerCase().includes(keyword))
  );
  
  if (reminderIndex !== -1 && reminderIndex < words.length - 1) {
    title = words.slice(reminderIndex + 1).join(" ");
    // Clean up common words
    title = title.replace(/(a las|at|en|in|el|la|los|las)/gi, "").trim();
  }

  if (!datetime) {
    datetime = new Date(Date.now() + 60 * 60 * 1000); // Default to 1 hour from now
  }

  return {
    title: title || "Recordatorio",
    datetime
  };
}
