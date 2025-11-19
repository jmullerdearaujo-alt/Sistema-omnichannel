import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { 
  MessageSquare, 
  Users, 
  BarChart3,
  ArrowRight,
  Shield,
  Zap,
  Globe
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "manager" || user.role === "admin") {
        setLocation("/manager");
      } else if (user.role === "attendant") {
        setLocation("/attendant");
      } else if (user.role === "patient") {
        setLocation("/patient");
      }
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{APP_TITLE}</h1>
                <p className="text-xs text-muted-foreground">Sistema Omnichannel</p>
              </div>
            </div>
            {!isAuthenticated && (
              <Button asChild>
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
            <MessageSquare className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Sistema Omnichannel para Clínica Médica
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unifique todos os canais de atendimento da sua clínica em uma única plataforma. 
            WhatsApp, Instagram, Facebook, E-mail e Chat integrados.
          </p>
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline">
                Saiba Mais
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Recursos Principais</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar o atendimento da sua clínica de forma eficiente
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-2">
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle>Omnichannel Integrado</CardTitle>
              <CardDescription>
                WhatsApp, Instagram, Facebook Messenger, E-mail e Chat do site em uma única caixa de entrada
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="p-3 bg-green-500/10 rounded-lg w-fit mb-2">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle>Respostas Rápidas</CardTitle>
              <CardDescription>
                Templates de mensagens e automação para agilizar o atendimento e aumentar a produtividade
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-2">
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle>Métricas e Relatórios</CardTitle>
              <CardDescription>
                Dashboard completo com métricas de desempenho, SLA e satisfação do paciente
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Roles Section */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Perfis de Acesso</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sistema adaptado para cada tipo de usuário
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                  <span>Histórico de conversas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                  <span>Confirmações de agendamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                  <span>Lembretes automáticos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></div>
                  <span>Múltiplos canais de contato</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-blue-500/5">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-blue-500/10 rounded-full w-fit mb-4">
                <MessageSquare className="h-10 w-10 text-blue-500" />
              </div>
              <CardTitle>Atendente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <span>Caixa de entrada unificada</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <span>Respostas rápidas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <span>Histórico completo do paciente</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <span>Notas internas</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-purple-500/5">
            <CardHeader className="text-center">
              <div className="mx-auto p-4 bg-purple-500/10 rounded-full w-fit mb-4">
                <Shield className="h-10 w-10 text-purple-500" />
              </div>
              <CardTitle>Gerente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <span>Dashboard de métricas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <span>Supervisão em tempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <span>Gestão de filas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <span>Relatórios de desempenho</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container py-20">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="text-center py-12">
              <h3 className="text-3xl font-bold mb-4">
                Pronto para transformar seu atendimento?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Comece agora e veja como o sistema omnichannel pode melhorar 
                a experiência dos seus pacientes e a produtividade da sua equipe.
              </p>
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>
                  Acessar Sistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 {APP_TITLE}. Sistema Omnichannel para Clínicas Médicas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
