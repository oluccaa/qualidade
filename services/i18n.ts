
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLanguage = localStorage.getItem('i18nextLng') || 'pt';

const resources = {
  pt: {
    translation: {
      common: {
        welcome: "Bem-vindo",
        search: "Pesquisar...",
        loading: "Carregando...",
        save: "Salvar",
        cancel: "Cancelar",
        delete: "Excluir",
        edit: "Editar",
        download: "Baixar",
        upload: "Upload",
        import: "Importar",
        create: "Criar",
        status: "Status",
        date: "Data",
        actions: "Ações",
        privacy: "Privacidade",
        changePassword: "Trocar Senha",
        logout: "Sair",
        back: "Voltar",
        close: "Fechar",
        confirm: "Confirmar",
        required: "Obrigatório",
        expand: "Expandir",
        collapse: "Recolher",
        menu: "Menu",
        all: "Todos",
        filter: "Filtrar",
        description: "Descrição",
        priority: "Prioridade"
      },
      login: {
        sloganTitle: "Sua porta de entrada para a Qualidade.",
        sloganText: "Centralize seus certificados e garanta a conformidade industrial com segurança e agilidade.",
        welcomeBack: "Bem-vindo de volta",
        enterCredentials: "Insira suas credenciais para acessar o portal.",
        emailLabel: "E-mail Corporativo",
        passwordLabel: "Senha de Acesso",
        forgotPassword: "Esqueci minha senha",
        accessPortal: "Acessar Portal"
      },
      signup: {
        title: "Criar Nova Conta",
        subtitle: "Preencha os dados abaixo para solicitar seu acesso ao portal.",
        fullName: "Nome Completo",
        email: "E-mail Profissional",
        organization: "Sua Empresa",
        department: "Departamento",
        password: "Senha",
        confirmPassword: "Confirmar Senha",
        submit: "Solicitar Acesso",
        successTitle: "Solicitação Enviada!",
        successText: "Sua conta foi criada. Você será redirecionado para o login em instantes."
      },
      admin: {
        tabs: {
          overview: "Visão Geral",
          users: "Usuários",
          clients: "Empresas Clientes",
          tickets: "Chamados Internos",
          logs: "Logs de Auditoria",
          settings: "Configurações"
        },
        stats: {
          totalUsers: "Total de Usuários",
          organizations: "Empresas Ativas",
          tickets: "Chamados em Aberto",
          activities: "Ações Recentes",
          loggedActions: "Eventos nas últimas 24h",
          b2bContracts: "Contratos Vigentes",
          systemHealth: "Integridade da Infraestrutura",
          cpuLoad: "Carga de Processamento",
          memoryUsage: "Uso de Memória",
          dbConnections: "Conexões com Banco",
          allOperational: "Todos os serviços operando normalmente",
          headers: {
            timestamp: "Horário",
            user: "Usuário",
            action: "Ação",
            target: "Destino",
            ip: "Endereço IP",
            severity: "Severidade"
          }
        },
        users: {
          identity: "Identidade",
          role: "Nível de Acesso",
          org: "Organização",
          newAccess: "Novo Acesso",
          createTitle: "Criar Novo Usuário",
          editTitle: "Editar Perfil de Usuário",
          name: "Nome Completo",
          email: "E-mail Corporativo",
          roleLabel: "Tipo de Perfil",
          department: "Departamento",
          orgLink: "Vincular à Empresa",
          filters: "Filtros de Lista"
        },
        settings: {
          techSupport: "Suporte N3 (Infra)"
        },
        tickets: {
          newTicket: "Novo Chamado",
          subject: "Assunto",
          status: {
            OPEN: "Aberto",
            IN_PROGRESS: "Em Atendimento",
            RESOLVED: "Resolvido"
          },
          priority: {
            LOW: "Baixa",
            MEDIUM: "Média",
            HIGH: "Alta",
            CRITICAL: "Crítica"
          }
        },
        n3Support: {
          title: "Suporte N3 (Infraestrutura)",
          subtitle: "Solicitação para equipe externa de DevOps/Cloud",
          component: "Componente Afetado",
          impact: "Nível de Impacto",
          context: "Contexto",
          module: "Módulo",
          steps: "Passos para Reproduzir",
          submit: "Enviar para Infra",
          success: "Solicitação enviada! Protocolo:",
          components: {
            INFRA_UP: "Upgrade de Infra",
            DB_MOD: "Modelagem/Banco",
            SECURITY_INC: "Incidente Segurança",
            BACKUP_RESTORE: "Backup/Restore",
            CUSTOM_DEV: "Desenvolvimento Sob Medida"
          },
          contexts: {
            SYSTEM: "Sistema Global",
            CLIENT: "Apenas Clientes",
            INTERNAL: "Apenas Interno"
          },
          modules: {
            AUTH: "Autenticação/Login",
            DASHBOARD: "Dashboard/Home",
            FILES: "Storage/Arquivos",
            API: "Backend/Integridade"
          }
        }
      },
      notifications: {
        title: "Notificações",
        markAll: "Ler todas",
        empty: "Nenhum aviso no momento"
      },
      files: {
        pending: "Em Análise",
        zipGenerating: "Gerando pacote de arquivos...",
        groups: {
          folders: "Pastas",
          approved: "Documentos Aprovados",
          pending: "Aguardando Revisão",
          ungrouped: "Outros"
        }
      },
      cookie: {
        title: "Segurança e Dados",
        text: "Utilizamos cookies e tecnologias de autenticação para garantir a proteção dos seus dados industriais e conformidade com a ISO 9001 e LGPD.",
        accept: "Aceitar e Entrar"
      },
      privacy: {
        title: "Política de Privacidade",
        subtitle: "Conformidade LGPD e ISO 9001",
        close: "Entendido",
        section1: "1. Escopo Industrial",
        section2: "2. Coleta de Dados Técnicos",
        section3: "3. Sigilo e Segregação B2B",
        section4: "4. Cookies de Autenticação",
        section5: "5. Seus Direitos"
      },
      changePassword: {
        title: "Alterar Senha de Acesso",
        current: "Senha Atual",
        new: "Nova Senha",
        confirm: "Confirmar Nova Senha",
        submit: "Atualizar Senha",
        matchError: "As senhas não coincidem.",
        success: "Senha alterada com sucesso!"
      },
      menu: {
        main: "Principal",
        home: "Início",
        library: "Biblioteca",
        quickAccess: "Acesso Rápido",
        recent: "Recentes",
        favorites: "Favoritos",
        tickets: "Suporte Técnico",
        support: "Suporte Técnico",
        dashboard: "Dashboard",
        documents: "Documentos",
        management: "Gestão Corporativa",
        portalName: "Portal da Qualidade",
        brand: "Aços Vital",
        system: "Menu do Sistema"
      },
      dashboard: {
        active: "Ativos no sistema",
        regular: "Usuário Regular",
        searchPlaceholder: "Lote, Corrida ou Nota Fiscal...",
        homeTitle: "Início",
        filesTitle: "Arquivos",
        recentTitle: "Recentes",
        favoritesTitle: "Favoritos",
        ticketsTitle: "Meus Chamados"
      },
      roles: {
        ADMIN: "Administrador",
        QUALITY: "Analista de Qualidade",
        CLIENT: "Cliente B2B"
      }
    }
  },
  en: {
    translation: {
      login: {
        welcomeBack: "Welcome back",
        enterCredentials: "Enter your credentials to access the portal."
      },
      admin: {
        tabs: {
          overview: "Overview",
          users: "Users",
          clients: "Clients",
          tickets: "Tickets",
          logs: "Logs",
          settings: "Settings"
        },
        stats: {
          totalUsers: "Total Users",
          organizations: "Organizations",
          tickets: "Open Tickets",
          activities: "Activities",
          systemHealth: "System Health"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "pt",
    interpolation: { escapeValue: false }
  });

export default i18n;
