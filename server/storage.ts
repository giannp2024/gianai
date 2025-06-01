import { users, messages, reminders, settings, type User, type InsertUser, type Message, type InsertMessage, type Reminder, type InsertReminder, type Setting, type InsertSetting } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;

  // Reminders
  getReminders(): Promise<Reminder[]>;
  getReminderById(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string): Promise<Setting>;
  getSettings(): Promise<Setting[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private reminders: Map<number, Reminder>;
  private settings: Map<string, Setting>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentReminderId: number;
  private currentSettingId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.reminders = new Map();
    this.settings = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentReminderId = 1;
    this.currentSettingId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
  }

  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
  }

  async getReminderById(id: number): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentReminderId++;
    const reminder: Reminder = { 
      ...insertReminder, 
      id, 
      completed: false,
      createdAt: new Date(),
      description: insertReminder.description || null
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...updates };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async deleteReminder(id: number): Promise<boolean> {
    return this.reminders.delete(id);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const existingSetting = this.settings.get(key);
    if (existingSetting) {
      const updated = { ...existingSetting, value };
      this.settings.set(key, updated);
      return updated;
    }
    
    const id = this.currentSettingId++;
    const setting: Setting = { id, key, value };
    this.settings.set(key, setting);
    return setting;
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
}

export const storage = new MemStorage();
