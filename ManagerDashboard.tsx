import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  UserCheck,
  UserX,
  Activity
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date(),
  });

  // Fetch dashboard stats
  const { data: stats } = trpc.metrics.getDashboardStats.useQuery();
  const { data: attendants = [] } = trpc.attendants.getAll.useQuery();
  const { data: conversations = [] } = trpc.conversations.getAll.useQuery();
  const { data: users = [] } = trpc.users.getAll.useQuery();
  const { data: allMetrics = [] } = trpc.metrics.getAllMetrics.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Calculate attendant performance
  const attendantPerformance = useMemo(() => {
    return attendants.map(attendant => {
      const attendantUser = users.find(u => u.id === attendant.userId);
      const attendantConversations = conversations.filter(c => c.attendantId === attendant.id);
      const closedConversations = attendantConversations.filter(c => c.status === "closed");
      const metrics = allMetrics.filter(m => m.attendantId === attendant.id);

      const avgResponseTime = metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length)
        : 0;

      const avgSatisfaction = metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.satisfactionScore, 0) / metrics.length)
        : 0;

      return {
        id: attendant.id,
        name: attendantUser?.name || "Atendente",
        status: attendant.status,
        totalConversations: attendantConversations.length,
        closedConversations: closedConversations.length,
        currentLoad: attendant.currentLoad,
        maxLoad: attendant.maxLoad,
        avgResponseTime,
        avgSatisfaction,
      };
    });
  }, [attendants, conversations, users, allMetrics]);

  // Recent conversations
  const recentConversations = useMemo(() => {
    return [...conversations]
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      .slice(0, 10);
  }, [conversations]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "text-green-500",
      busy: "text-yellow-500",
      offline: "text-gray-500",
    };
    return colors[status] || "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel do Gerente</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.name || "Gerente"}
            </p>
          </div>
          <Button onClick={() => setLocation("/reports")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Relatórios Detalhados
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Conversas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.openConversations || 0} abertas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fechadas Hoje
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.closedToday || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Conversas resolvidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Atendentes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAttendants || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.availableAttendants || 0} disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Atendentes Ocupados
              </CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.busyAttendants || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Em atendimento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="attendants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendants">Desempenho dos Atendentes</TabsTrigger>
            <TabsTrigger value="conversations">Conversas Recentes</TabsTrigger>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          </TabsList>

          {/* Attendants Performance */}
          <TabsContent value="attendants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho dos Atendentes</CardTitle>
                <CardDescription>
                  Métricas de produtividade e qualidade de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atendente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Conversas</TableHead>
                      <TableHead className="text-right">Fechadas</TableHead>
                      <TableHead className="text-right">Carga Atual</TableHead>
                      <TableHead className="text-right">Tempo Médio</TableHead>
                      <TableHead className="text-right">Satisfação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendantPerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Nenhum atendente encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendantPerformance.map((perf) => (
                        <TableRow key={perf.id}>
                          <TableCell className="font-medium">{perf.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(perf.status)}>
                              {perf.status === "available" ? "Disponível" :
                               perf.status === "busy" ? "Ocupado" : "Offline"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{perf.totalConversations}</TableCell>
                          <TableCell className="text-right">{perf.closedConversations}</TableCell>
                          <TableCell className="text-right">
                            {perf.currentLoad} / {perf.maxLoad}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.avgResponseTime > 0 ? formatTime(perf.avgResponseTime) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {perf.avgSatisfaction > 0 ? `${perf.avgSatisfaction}%` : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Conversations */}
          <TabsContent value="conversations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversas Recentes</CardTitle>
                <CardDescription>
                  Últimas interações com pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {recentConversations.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma conversa encontrada</p>
                      </div>
                    ) : (
                      recentConversations.map((conversation) => {
                        const attendant = attendants.find(a => a.id === conversation.attendantId);
                        const attendantUser = attendant ? users.find(u => u.id === attendant.userId) : null;

                        return (
                          <Card 
                            key={conversation.id}
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => setLocation(`/conversation/${conversation.id}`)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">
                                      {conversation.subject || `Conversa #${conversation.id}`}
                                    </h4>
                                    <Badge className={`status-badge status-${conversation.status}`}>
                                      {conversation.status === "open" ? "Aberta" :
                                       conversation.status === "waiting" ? "Aguardando" :
                                       conversation.status === "closed" ? "Fechada" : "Escalada"}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>Paciente ID: {conversation.patientId}</span>
                                    {attendantUser && (
                                      <span>Atendente: {attendantUser.name}</span>
                                    )}
                                    <span>
                                      {new Date(conversation.lastMessageAt).toLocaleString("pt-BR")}
                                    </span>
                                  </div>
                                </div>
                                <Badge className={`priority-${conversation.priority}`}>
                                  {conversation.priority === "low" ? "Baixa" :
                                   conversation.priority === "normal" ? "Normal" :
                                   conversation.priority === "high" ? "Alta" : "Urgente"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Atendentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Disponíveis</span>
                    </div>
                    <span className="text-2xl font-bold">{stats?.availableAttendants || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium">Ocupados</span>
                    </div>
                    <span className="text-2xl font-bold">{stats?.busyAttendants || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserX className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">Offline</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {(stats?.totalAttendants || 0) - (stats?.availableAttendants || 0) - (stats?.busyAttendants || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Conversas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Abertas</span>
                    </div>
                    <span className="text-2xl font-bold">{stats?.openConversations || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Fechadas Hoje</span>
                    </div>
                    <span className="text-2xl font-bold">{stats?.closedToday || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <span className="text-2xl font-bold">{stats?.totalConversations || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
