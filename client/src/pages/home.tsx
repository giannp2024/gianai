import { useState } from "react";
import ChatInterface from "@/components/chat-interface";
import SettingsPanel from "@/components/settings-panel";
import { Button } from "@/components/ui/button";
import { Settings, Bot } from "lucide-react";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="h-full flex flex-col max-w-md mx-auto relative bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-muted border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Gian AI</h1>
            <p className="text-xs text-muted-foreground">En línea</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Chat Interface */}
      <ChatInterface />

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
