import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Mail, Volume2, Bell, Trash2, History } from "lucide-react";
import { useReminders } from "@/hooks/use-reminders";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [userEmail, setUserEmail] = useState("");
  const [speechResponse, setSpeechResponse] = useState(true);
  const [voiceInput, setVoiceInput] = useState(true);
  
  const { reminders, deleteReminder } = useReminders();
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedEmail = localStorage.getItem("userEmail");
    const savedSpeech = localStorage.getItem("speechResponse");
    const savedVoice = localStorage.getItem("voiceInput");
    
    if (savedEmail) setUserEmail(savedEmail);
    if (savedSpeech) setSpeechResponse(savedSpeech === "true");
    if (savedVoice) setVoiceInput(savedVoice === "true");
  }, []);

  const saveEmail = () => {
    localStorage.setItem("userEmail", userEmail);
    toast({
      title: "Configuración guardada",
      description: "Tu correo electrónico ha sido actualizado.",
    });
  };

  const handleSpeechToggle = (enabled: boolean) => {
    setSpeechResponse(enabled);
    localStorage.setItem("speechResponse", enabled.toString());
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceInput(enabled);
    localStorage.setItem("voiceInput", enabled.toString());
  };

  const handleDeleteReminder = async (id: number) => {
    try {
      await deleteReminder(id);
      toast({
        title: "Recordatorio eliminado",
        description: "El recordatorio ha sido eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el recordatorio.",
        variant: "destructive",
      });
    }
  };

  const clearHistory = async () => {
    try {
      await apiRequest("DELETE", "/api/messages");
      toast({
        title: "Historial limpiado",
        description: "Todas las conversaciones han sido eliminadas.",
      });
      // Reload the page to refresh the messages
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo limpiar el historial.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end">
      <Card className="w-full max-w-md mx-4 mb-4 bg-muted border-border slide-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Configuración</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 max-h-96 overflow-y-auto">
          {/* Email Configuration */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Configuración de Email</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Correo de destino
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="flex-1 bg-input border-border"
                  />
                  <Button onClick={saveEmail} size="sm">
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Voice Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Configuración de Voz</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Respuesta hablada</span>
                  <p className="text-sm text-muted-foreground">Activar respuestas por voz</p>
                </div>
                <Switch
                  checked={speechResponse}
                  onCheckedChange={handleSpeechToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Entrada por voz</span>
                  <p className="text-sm text-muted-foreground">Permitir comandos de voz</p>
                </div>
                <Switch
                  checked={voiceInput}
                  onCheckedChange={handleVoiceToggle}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Reminders */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Recordatorios Activos</h3>
            </div>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {reminders.length > 0 ? (
                reminders
                  .filter(reminder => !reminder.completed)
                  .map((reminder) => (
                    <Card key={reminder.id} className="reminder-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{reminder.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reminder.datetime), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-red-400 hover:text-red-300 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">No hay recordatorios activos</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Chat History */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold">Historial de Conversaciones</h3>
            </div>
            <Button
              onClick={clearHistory}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar historial
            </Button>
          </div>

          <Separator />

          {/* About */}
          <div>
            <h3 className="text-base font-semibold mb-2">Acerca de</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Gian AI v1.0.0</p>
              <p className="text-xs text-muted-foreground">
                Asistente personal inteligente con capacidades de voz, recordatorios y envío de emails.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
