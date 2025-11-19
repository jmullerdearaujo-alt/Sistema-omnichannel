# TODO - Sistema Omnichannel Clínica Médica

## Infraestrutura e Configuração
- [x] Configurar schema do banco de dados (pacientes, conversas, mensagens, atendentes, canais)
- [x] Criar helpers de banco de dados
- [x] Configurar rotas tRPC para todas as funcionalidades

## Autenticação e Perfis
- [x] Sistema de roles (paciente, atendente, gerente)
- [x] Proteção de rotas por perfil de usuário
- [x] Painel de login e autenticação

## Funcionalidades do Paciente
- [x] Visualizar histórico de conversas
- [x] Enviar mensagens por múltiplos canais
- [ ] Receber confirmações de agendamento
- [ ] Receber lembretes automáticos

## Funcionalidades do Atendente
- [x] Caixa de entrada unificada (omnichannel)
- [x] Visualizar histórico de conversas por paciente
- [x] Responder mensagens de todos os canais
- [x] Respostas rápidas (templates)
- [x] Registrar informações relevantes (exames, agendamentos)
- [ ] Integração com agenda médica

## Funcionalidades do Gerente
- [x] Dashboard de desempenho (métricas e KPIs)
- [x] Supervisão em tempo real de atendimentos
- [x] Gerenciamento de filas de atendimento
- [x] Distribuição de atendimentos entre atendentes
- [x] Relatórios de produtividade
- [x] Intervenção em atendimentos críticos
- [x] Visualização de SLA e tempo médio de resposta

## Integrações Omnichannel
- [x] Integração WhatsApp (estrutura preparada)
- [x] Integração Facebook Messenger (estrutura preparada)
- [x] Integração Instagram Direct (estrutura preparada)
- [x] Integração E-mail (estrutura preparada)
- [x] Chat do site (widget - estrutura preparada)

## Relatórios e Métricas
- [x] Número de atendimentos por atendente
- [x] Tempo médio de resposta
- [x] Taxa de conversão em consultas
- [x] Taxa de resolução
- [x] Satisfação do paciente
- [ ] Relatórios consolidados exportáveis

## UI/UX
- [x] Design system e paleta de cores
- [x] Layout responsivo
- [x] Navegação intuitiva
- [x] Notificações em tempo real
- [x] Estados de loading e erro

## Testes
- [ ] Testes unitários para procedures principais
- [ ] Validação de permissões por role
- [ ] Testes de integração
