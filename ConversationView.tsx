import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  User,
  Clock,
  FileText,
  Zap
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function ConversationView() {
  const { user } = useAuth();
  const [, params] = useRoute("/conversation/:id");
  const [, setLocation] = useLocation();
  const conversationId = params?.id ? parseInt(params.id) : 0;

  const [message, setMessage] = useState("");
  const [noteText, setNoteText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Fetch conversation data
  const { data: conversation } = trpc.conversations.getById.useQuery(
    { id: conversationId },
    { enabled: conversationId > 0 }
  );

  const { data: messages = [] } = trpc.messages.getByConversation.useQuery(
    { conversationId },
    { enabled: conversationId > 0, refetchInterval: 3000 }
  );

  const { data: notes = [] } = trpc.notes.getByConversation.useQuery(
    { conversationId },
    { enabled: conversationId > 0 }
  );

  const { data: quickReplies = [] } = trpc.quickReplies.getAll.useQuery();
  const { data: users = [] } = trpc.users.getAll.useQuery();

  // Mutations
  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.messages.getByConversation.invalidate({ conversationId });
      utils.conversations.getById.invalidate({ id: conversationId });
      scrollToBottom();
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  const updateStatus = trpc.conversations.updateStatus.useMutation({
    onSuccess: () => {
      utils.conversations.getById.invalidate({ id: conversationId });
      utils.conversations.getAll.invalidate();
      toast.success("Status atualizado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const addNote = trpc.notes.create.useMutation({
    onSuccess: () => {
      setNoteText("");
      utils.notes.getByConversation.invalidate({ conversationId });
      toast.success("Nota adicionada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar nota: " + error.message);
    },
  });

  const markAsRead = trpc.messages.markAsRead.useMutation();

  useEffect(() => {
    if (conversationId > 0) {
      markAsRead.mutate({ conversationId });
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessage.mutate({
      conversationId,
      content: message,
      messageType: "text",
    });
  };

  const handleQuickReply = (content: string) => {
    setMessage(content);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;

    addNote.mutate({
      conversationId,
      note: noteText,
    });
  };

  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserName = (userId: number) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || "Usuário";
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando conversa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/attendant")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {conversation.subject || `Conversa #${conversation.id}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                Paciente ID: {conversation.patientId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`status-badge status-${conversation.status}`}>
              {conversation.status === "open" ? "Aberta" :
               conversation.status === "waiting" ? "Aguardando" :
               conversation.status === "closed" ? "Fechada" : "Escalada"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateStatus.mutate({ conversationId, status: "open" })}>
                  Marcar como Aberta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus.mutate({ conversationId, status: "waiting" })}>
                  Marcar como Aguardando
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus.mutate({ conversationId, status: "closed" })}>
                  Fechar Conversa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateStatus.mutate({ conversationId, status: "escalated" })}>
                  Escalar para Gerente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mensagens</CardTitle>
              </CardHeader>
              <Separator />
              
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Nenhuma mensagem ainda</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAttendant = msg.senderType === "attendant";
                      const isCurrentUser = msg.senderId === user?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3" />
                              <span className="text-xs font-medium">
                                {getUserName(msg.senderId)}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              <Separator />
              
              <div className="p-4 space-y-3">
                {/* Quick Replies */}
                {quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Zap className="h-4 w-4 mr-2" />
                          Respostas Rápidas
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Respostas Rápidas</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-2">
                            {quickReplies.map((reply) => (
                              <Card
                                key={reply.id}
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => handleQuickReply(reply.content)}
                              >
                                <CardContent className="p-3">
                                  <h4 className="font-medium text-sm mb-1">{reply.title}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {reply.content}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessage.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Notes and Info */}
          <div className="space-y-4">
            {/* Conversation Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
                  <Badge className={`priority-${conversation.priority} mt-1`}>
                    {conversation.priority === "low" ? "Baixa" :
                     conversation.priority === "normal" ? "Normal" :
                     conversation.priority === "high" ? "Alta" : "Urgente"}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criada em</p>
                  <p className="text-sm mt-1">
                    {new Date(conversation.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última mensagem</p>
                  <p className="text-sm mt-1">
                    {new Date(conversation.lastMessageAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas Internas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicionar nota interna..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!noteText.trim() || addNote.isPending}
                    className="w-full"
                    size="sm"
                  >
                    Adicionar Nota
                  </Button>
                </div>

                <Separator />

                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma nota ainda
                      </p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.createdAt).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
