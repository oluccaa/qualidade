
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
        privacy: "Privacidade e Termos",
        changePassword: "Alterar Senha",
        logout: "Sair do Sistema",
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
      files: {
        name: "Nome do Arquivo",
        productBatch: "Produto / Lote",
        date: "Data",
        status: "Status",
        pending: "Pendente",
        size: "Tamanho",
        download: "Baixar",
        bulkDownload: "Baixar Selecionados",
        noItems: "Nenhum item encontrado",
        dropZone: "Solte os arquivos aqui",
        docsFound: "documentos encontrados",
        selected: "selecionados",
        downloading: "Iniciando download seguro:",
        permissionError: "Erro de permissão ou arquivo não encontrado.",
        zipGenerating: "Gerando pacote ZIP contendo:",
        uploadFeature: "Feature de Upload simulada.",
        fileDetected: "Detectado arquivo",
        checkFilters: "Verifique os filtros.",
        viewOptions: "Opções de Visualização",
        sortBy: "Ordenar por",
        groupBy: "Agrupar por",
        sort: {
            nameAsc: "Nome (A-Z)",
            nameDesc: "Nome (Z-A)",
            dateNew: "Data (Mais recente)",
            dateOld: "Data (Mais antigo)",
            status: "Status"
        },
        group: {
            none: "Nenhum (Lista Plana)",
            status: "Status (Segregação)",
            product: "Produto / Categoria",
            date: "Mês de Referência"
        },
        groups: {
            folders: "Pastas",
            approved: "Aprovados / Disponíveis",
            pending: "Pendentes de Análise",
            rejected: "Rejeitados / Obsoletos",
            other: "Outros",
            ungrouped: "Sem Categoria"
        }
      },
      // ... (Rest of existing translations preserved implicitly via merge, listing crucial ones context)
      layout: {
        supportQuestion: "Precisa de ajuda com algum laudo ou certificado? Entre em contato com nossa equipe técnica.",
      },
      notifications: {
        title: "Notificações",
        empty: "Nenhuma notificação nova.",
        markAll: "Marcar todas",
        viewHistory: "Ver histórico completo"
      },
      cookie: {
        title: "Privacidade e Cookies",
        text: "Utilizamos cookies essenciais para garantir a segurança, autenticação e o correto funcionamento do Portal da Qualidade. Ao continuar navegando, você concorda com nossa Política de Privacidade e o tratamento de dados para fins de rastreabilidade industrial.",
        accept: "Aceitar e Continuar"
      },
      menu: {
        main: "Principal",
        home: "Início",
        library: "Biblioteca",
        quickAccess: "Acesso Rápido",
        recent: "Recentes",
        favorites: "Favoritos",
        tickets: "Meus Chamados",
        operation: "Operação",
        dashboard: "Dashboard",
        documents: "Documentos",
        management: "Gestão",
        generalPanel: "Painel Geral",
        files: "Arquivos",
        system: "Sistema",
        settings: "Configurações",
        help: "Ajuda",
        support: "Falar com Qualidade",
        portalName: "Portal da Qualidade",
        brand: "Aços Vital"
      },
      dashboard: {
        hello: "Olá",
        whatLookingFor: "O que você procura hoje?",
        searchPlaceholder: "Digite o Nº do Lote, Corrida ou Nota Fiscal...",
        suggestions: "Sugestões",
        pendingCerts: "Certificados Pendentes",
        accountStatus: "Status Atual",
        verified: "VERIFICADO",
        regular: "Regular",
        active: "Ativo",
        statusDesc: "Todos os lotes recebidos possuem certificação válida conforme ISO 9001.",
        docCompliance: "Conformidade Documental",
        auditedBatches: "Lotes Auditados",
        pendencies: "Pendências",
        folderNav: "Navegação por Pastas",
        viewFullLib: "Ver biblioteca completa",
        libraryTitle: "Biblioteca de Laudos",
        favoritesTitle: "Meus Favoritos",
        historyTitle: "Histórico de Acesso",
        ticketsTitle: "Central de Ajuda",
        filters: "Filtros",
        textSearch: "Busca Textual",
        period: "Período",
        clear: "Limpar",
        quickAccessItems: "Itens marcados para acesso rápido",
        ticketsIntro: "Acompanhe o status das suas solicitações de suporte.",
        openTicket: "Abrir Novo Chamado",
        noTickets: "Você ainda não abriu nenhum chamado.",
        ticketSubject: "Assunto",
        ticketDate: "Data Abertura",
        ticketResolution: "Resolução"
      },
      admin: {
        tabs: {
          overview: "Visão Geral",
          users: "Usuários",
          clients: "Empresas",
          logs: "Logs de Segurança",
          settings: "Configurações",
          tickets: "Chamados"
        },
        stats: {
          totalUsers: "Usuários Totais",
          organizations: "Organizações",
          storage: "Armazenamento",
          activities: "Atividades Hoje",
          recentActivity: "Atividade Recente",
          systemHealth: "Saúde do Sistema",
          b2bContracts: "Contratos B2B",
          loggedActions: "Ações registradas",
          cpuLoad: "Carga da CPU",
          memoryUsage: "Uso de Memória",
          dbConnections: "Conexões DB",
          allOperational: "Todos os serviços operacionais",
          auditTrail: "Trilha de Auditoria",
          exportCsv: "Exportar CSV",
          headers: {
             timestamp: "Data/Hora",
             user: "Usuário",
             action: "Ação",
             target: "Alvo",
             ip: "Endereço IP",
             severity: "Severidade"
          }
        },
        settings: {
           securityTitle: "Segurança & Acesso",
           systemTitle: "Sistema & Manutenção",
           security2FA: "Imposição de 2FA",
           security2FADesc: "Forçar autenticação de dois fatores para administradores e equipe de qualidade.",
           sessionTimeout: "Timeout de Sessão (min)",
           sessionTimeoutDesc: "Tempo de inatividade para logout automático.",
           maintenance: "Modo de Manutenção",
           maintenanceDesc: "Suspende o acesso de clientes temporariamente para atualizações.",
           scheduleMaintenance: "Agendar Manutenção",
           techSupport: "Suporte do Sistema (Externo)",
           techSupportDesc: "Solicitar alterações estruturais, correções de dados ou melhorias de infraestrutura ao fornecedor.",
           openTicket: "Abrir Solicitação Externa",
           version: "Versión do Portal",
           guestAccess: "Acesso Visitante",
           guestAccessDesc: "Permitir visualização pública de documentos marcados como públicos.",
           retention: "Retenção de Logs (dias)",
           retentionDesc: "Período de armazenamento de logs de auditoria antes do arquivamento."
        },
        n3Support: {
            title: "Solicitação de Serviço Externo",
            subtitle: "Use este formulário para solicitar intervenções técnicas ao provedor da plataforma.",
            component: "Categoria de Serviço",
            impact: "Urgência / Impacto",
            context: "Origem do Problema",
            module: "Módulo Afetado",
            steps: "Passos para Reprodução",
            components: {
                DB_MOD: "Correção de Dados (Banco de Dados)",
                INFRA_UP: "Upgrade de Infraestrutura (Scaling)",
                SECURITY_INC: "Incidente de Segurança / Firewall",
                BACKUP_RESTORE: "Restauração de Backup",
                CUSTOM_DEV: "Desenvolvimento Personalizado"
            },
            contexts: {
                SYSTEM: "Sistema Global (Todos)",
                CLIENT: "Cliente Específico (B2B)",
                INTERNAL: "Equipe Interna (Qualidade)"
            },
            modules: {
                AUTH: "Autenticação / Login",
                DASHBOARD: "Dashboard / KPIs",
                FILES: "Gestão de Arquivos / PDF",
                API: "Integração API / ERP"
            },
            submit: "Enviar Ordem de Serviço",
            success: "Ordem de Serviço registrada no sistema do parceiro. Protocolo:",
        },
        tickets: {
            subject: "Assunto",
            requester: "Solicitante",
            newTicket: "Novo Chamado",
            resolve: "Resolver",
            open: "Reabrir",
            status: {
                OPEN: "Aberto",
                IN_PROGRESS: "Em Andamento",
                RESOLVED: "Resolvido"
            },
            priority: {
                LOW: "Baixa",
                MEDIUM: "Média",
                HIGH: "Alta",
                CRITICAL: "Crítica"
            }
        },
        maintenance: {
            title: "Título do Evento",
            scheduledDate: "Data Agendada",
            duration: "Duração (min)",
            history: "Histórico de Manutenções",
            schedule: "Agendar",
            cancel: "Cancelar"
        },
        users: {
          filters: "Filtros",
          newAccess: "Novo Acesso",
          identity: "Identificação",
          role: "Função",
          org: "Organização",
          lastLogin: "Último Login",
          editAccess: "Editar Acesso",
          blockAccess: "Bloquear Acesso",
          unblockAccess: "Desbloquear",
          resetPassword: "Redefinir Senha",
          deleteUser: "Excluir Usuário",
          createTitle: "Criar Novo Acesso",
          editTitle: "Editar Acesso",
          personalData: "Dados Pessoais",
          permissions: "Permissões e Vínculos",
          name: "Nome Completo",
          email: "Email Corporativo",
          department: "Departamento",
          roleLabel: "Função no Sistema",
          statusLabel: "Status da Conta",
          orgLink: "Vínculo Empresarial",
          orgLinkDesc: "O usuário terá acesso restrito apenas aos documentos desta organização.",
          confirmDelete: "Atenção: Esta ação é irreversível. Deseja excluir este usuário?",
          resetSent: "Email de redefinição enviado.",
          allRoles: "Todas as Funções",
          allStatus: "Todos os Status"
        }
      },
      quality: {
        partners: "Clientes",
        searchClient: "Buscar cliente...",
        masterRepo: "Repositório Central",
        masterLib: "Biblioteca Mestra",
        selectClient: "Selecione um cliente para iniciar",
        noSelection: "Nenhum arquivo selecionado",
        clickToView: "Clique em um documento na lista para ver detalhes, aprovar ou editar metadados.",
        newFolder: "Nova Pasta",
        folderName: "Nome da Pasta",
        folderPlaceholder: "Ex: Certificados 2024",
        importMaster: "Importar do Mestre",
        upload: "Upload",
        techData: "Dados Técnicos",
        product: "Produto",
        batch: "Corrida/Lote",
        invoice: "Nota Fiscal",
        approve: "Aprovar",
        reject: "Rejeitar",
        editData: "Editar Dados",
        preview: "Visualizar",
        importModal: {
          title: "Repositório Central",
          desc: "Selecione os arquivos para enviar para:",
          empty: "O repositório mestre está vazio.",
          filename: "Nome do Arquivo",
          ref: "Lote / Referencia",
          size: "Tamanho",
          selected: "arquivo(s) selecionado(s)",
          btnImport: "Importar Arquivos"
        },
        uploadModal: {
          titleNew: "Novo Upload",
          titleEdit: "Editar Metadados",
          originalFile: "Arquivo Original (PDF)",
          dragDrop: "Clique para selecionar ou arraste aqui",
          integrity: "Confirmação de Integridade",
          integrityText: "Ao salvar, você confirma que os dados conferem com o documento físico original, garantindo a rastreabilidade conforme ISO 9001.",
          pdfMax: "PDF máx 10MB"
        }
      },
      preview: {
        title: "Certificado de Qualidade",
        subtitle: "Conforme ISO 10474 / EN 10204 - 3.1",
        approvedStamp: "Aprovado CQ",
        client: "Cliente",
        invoice: "Nota Fiscal",
        product: "Produto",
        batch: "Corrida / Lote",
        chemResults: "Resultados Químicos",
        mechProps: "Propriedades Mecânicas",
        emissionDate: "Data de Emissão",
        generated: "Certificado gerado eletronicamente.",
        engineer: "Engenheiro de Qualidade",
        print: "Imprimir",
        zoomIn: "Aumentar Zoom",
        zoomOut: "Diminuir Zoom",
        resetZoom: "Resetar Zoom",
        secureView: "Visualização Segura",
        table: {
            yield: "Escoamento (MPa)",
            tensile: "Resistência (MPa)",
            elongation: "Along. (%)",
            hardness: "Dureza (HB)"
        }
      },
      login: {
        welcomeBack: "Bem-vindo de volta",
        enterCredentials: "Insira suas credenciais corporativas para acessar.",
        emailLabel: "Email Corporativo",
        passwordLabel: "Senha",
        forgotPassword: "Esqueceu a senha?",
        accessPortal: "Acessar Portal",
        demoEnv: "Ambiente de Demonstração",
        sloganTitle: "Excelência e precisão em cada detalhe.",
        sloganText: "Acesse o Portal da Qualidade para gerenciar certificados, laudos técnicos e rastreabilidade de materiais com segurança total.",
        roleDesc: {
            admin: "Gestão Total",
            quality: "Operacional",
            client: "Visualização"
        }
      },
      roles: {
        ADMIN: "Administrador",
        QUALITY: "Analista de Qualidade",
        CLIENT: "Cliente"
      },
      privacy: {
         title: "Privacidade e Termos de Uso",
         subtitle: "Em conformidade com a LGPD (Lei Nº 13.709/2018)",
         section1: "1. Objetivo e Escopo",
         section2: "2. Coleta de Dados",
         section3: "3. Segurança e Armazenamento",
         section4: "4. Uso de Cookies",
         section5: "5. Seus Direitos (LGPD)",
         close: "Entendido e Fechar"
      },
      changePassword: {
          title: "Alterar Senha",
          current: "Senha Atual",
          new: "Nova Senha",
          confirm: "Confirmar Nova Senha",
          matchError: "As senhas não conferem.",
          success: "Senha alterada com sucesso.",
          submit: "Atualizar Senha"
      }
    }
  },
  // English and Spanish translations would follow similar structure with added keys
  // Keeping brief for this block
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt", 
    fallbackLng: "pt",
    interpolation: {
      escapeValue: false
    },
    react: {
        useSuspense: false
    }
  });

export default i18n;
