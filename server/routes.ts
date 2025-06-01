import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertReminderSchema, insertSettingSchema } from "@shared/schema";
import OpenAI from "openai";
import nodemailer from "nodemailer";

// Using Deepseek via OpenRouter as a free alternative
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-openrouter-key",
  baseURL: "https://openrouter.ai/api/v1"
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Generate AI response
      const response = await openai.chat.completions.create({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: `You are Gian AI, a helpful personal assistant. You can help with:
            - Creating, managing, and deleting reminders
            - Answering general questions
            - Providing weather information (mock data)
            - Sending information via email
            - Time and date queries
            
            Always respond in Spanish in a friendly and helpful manner. Keep responses concise but informative.
            
            If the user asks to create a reminder, extract the task and datetime and respond that you've created it.
            If they ask about weather, provide realistic mock weather data.
            If they ask to send something via email, confirm that you'll send it.`
          },
          {
            role: "user",
            content: messageData.content
          }
        ],
      });

      const aiContent = response.choices[0].message.content || "Lo siento, no pude procesar tu solicitud.";
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        content: aiContent,
        sender: "assistant"
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Clear conversation history
  app.delete("/api/messages", async (req, res) => {
    try {
      await storage.clearMessages();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  // Get all reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  // Create a reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const reminderData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(reminderData);
      res.json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ error: "Failed to create reminder" });
    }
  });

  // Update a reminder
  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const reminder = await storage.updateReminder(id, updates);
      
      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reminder" });
    }
  });

  // Delete a reminder
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteReminder(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reminder" });
    }
  });

  // Send email
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, content } = req.body;
      
      if (!to || !subject || !content) {
        return res.status(400).json({ error: "Missing required fields: to, subject, content" });
      }

      const mailOptions = {
        from: process.env.SMTP_USER || process.env.EMAIL_USER,
        to,
        subject,
        text: content,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update a setting
  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ error: "Value is required" });
      }
      
      const setting = await storage.setSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
