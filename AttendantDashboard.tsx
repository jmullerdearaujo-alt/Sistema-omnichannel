import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Globe
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

const channelIcons: Record<string, any> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  email: Mail,
  webchat: Globe,
  phone: Phone,
};

export default function AttendantDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("all");

  // Fetch attendant profile
  const { data: attendant } = trpc.attendants.getMyProfile.useQuery();
  
  // Fetch conversations
  const { data: myConversations = [] } = trpc.conversations.getByAttendant.useQuery(
    { attendantId: attendant?.id || 0 },
    { enabled: !!attendant }
  );

  const { data: openConversations = [] } = trpc.conversations.getOpen.useQuery();
  const { data: channels = [] } = trpc.channels.getAll.useQuery();

  // Filter conversations based on selected tab
  const filteredConversations = useMemo(() => {
    const conversations = selectedTab === "my" ? myConversations : openConversations;
    return conversations;
  }, [selectedTab, myConversations, openConversations]);

  // Stats
  const stats = useMemo(() => {
    const total = myConversations.length;
    const open = myConversations.filter(c => c.status === "open").length;
    const waiting = myConversations.filter(c => c.status === "waiting").length;
    const closed = myConversations.filter(c => c.status === "closed").length;

    return { total, open, waiting, closed };
  }, [myConversations]);

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

  const getChannelIcon = (channelId: number) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return Globe;
    return channelIcons[channel.type] || Globe;
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

  const getPriorityIcon = (priority: string) => {
    const priorityMap: Record<string, { icon: any; className: string }> = {
      low: { icon: Clock, className: "priority-low" },
      normal: { icon: MessageSquare, className: "priority-normal" },
      high: { icon: AlertCircle, className: "priority-high" },
      urgent: { icon: AlertCircle, className: "priority-urgent" },
    };

    const config = priorityMap[priority] || priorityMap.normal;
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.className}`} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel do Atendente</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.name || "Atendente"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              Status: {attendant?.status === "available" ? "Disponível" : attendant?.status === "busy" ? "Ocupado" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Conversas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Abertas
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aguardando
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.waiting}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fechadas
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>Caixa de Entrada Unificada</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="all">Todas as Conversas</TabsTrigger>
                <TabsTrigger value="my">Minhas Conversas</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {filteredConversations.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma conversa encontrada</p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => {
                        const ChannelIcon = getChannelIcon(conversation.channelId);
                        
                        return (
                          <Card 
                            key={conversation.id} 
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => setLocation(`/conversation/${conversation.id}`)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <ChannelIcon className="h-5 w-5 text-primary" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold truncate">
                                        {conversation.subject || `Conversa #${conversation.id}`}
                                      </h4>
                                      {getPriorityIcon(conversation.priority)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Paciente ID: {conversation.patientId}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatTime(conversation.lastMessageAt)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  {getStatusBadge(conversation.status)}
                                  {conversation.attendantId && (
                                    <Badge variant="outline" className="text-xs">
                                      Atribuída
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="my" className="mt-0">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {filteredConversations.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Você não tem conversas atribuídas</p>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => {
                        const ChannelIcon = getChannelIcon(conversation.channelId);
                        
                        return (
                          <Card 
                            key={conversation.id} 
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => setLocation(`/conversation/${conversation.id}`)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <ChannelIcon className="h-5 w-5 text-primary" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold truncate">
                                        {conversation.subject || `Conversa #${conversation.id}`}
                                      </h4>
                                      {getPriorityIcon(conversation.priority)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Paciente ID: {conversation.patientId}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatTime(conversation.lastMessageAt)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  {getStatusBadge(conversation.status)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
