import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Calendar,
  Clock,
  Plus,
  FileText
} from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch patient data
  const { data: patient } = trpc.patients.getMyProfile.useQuery();
  
  const { data: conversations = [] } = trpc.conversations.getByPatient.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: !!patient }
  );

  const { data: appointments = [] } = trpc.appointments.getByPatient.useQuery(
    { patientId: patient?.id || 0 },
    { enabled: !!patient }
  );

  // Stats
  const stats = useMemo(() => {
    const total = conversations.length;
    const open = conversations.filter(c => c.status === "open").length;
    const upcoming = appointments.filter(a => {
      return new Date(a.scheduledAt) > new Date() && a.status !== "cancelled";
    }).length;

    return { total, open, upcoming };
  }, [conversations, appointments]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return "Agora";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      open: { label: "Aberta", className: "status-open" },
      waiting: { label: "Aguardando", className: "status-waiting" },
      closed: { label: "Fechada", className: "status-closed" },
      escalated: { label: "Escalada", className: "status-escalated" },
    };

    const config = statusMap[status] || statusMap.open;
    return (
      <Badge className={`status-badge ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getAppointmentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      scheduled: { label: "Agendada", variant: "default" },
      confirmed: { label: "Confirmada", variant: "default" },
      cancelled: { label: "Cancelada", variant: "destructive" },
      completed: { label: "Concluída", variant: "secondary" },
    };

    const config = statusMap[status] || statusMap.scheduled;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meu Painel</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.name || "Paciente"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Conversas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.open} em aberto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próximas Consultas
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Agendadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversas Abertas
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando resposta
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Conversations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Minhas Conversas</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conversa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {conversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma conversa encontrada</p>
                      <p className="text-sm mt-2">Inicie uma nova conversa com a clínica</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <Card 
                        key={conversation.id} 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setLocation(`/conversation/${conversation.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold truncate">
                                  {conversation.subject || `Conversa #${conversation.id}`}
                                </h4>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageAt)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(conversation.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Minhas Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma consulta agendada</p>
                    </div>
                  ) : (
                    appointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">
                                  Dr(a). {appointment.doctorName}
                                </h4>
                                {appointment.specialty && (
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.specialty}
                                  </p>
                                )}
                              </div>
                              {getAppointmentStatusBadge(appointment.status)}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {new Date(appointment.scheduledAt).toLocaleDateString("pt-BR")}
                              </span>
                              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                              <span>
                                {new Date(appointment.scheduledAt).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {appointment.notes && (
                              <div className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="text-muted-foreground">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
