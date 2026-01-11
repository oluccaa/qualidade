
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
        noItems: "Nenhum documento encontrado.",
        dropZone: "Solte os arquivos aqui",
        docsFound: "documentos encontrados",
        selected: "selecionados",
        downloading: "Preparando download seguro...",
        permissionError: "Erro de permissão ou arquivo não encontrado.",
        fileDetected: "Arquivo detectado",
        viewOptions: "Opções de Visualização",
        sortBy: "Ordenar por",
        groupBy: "Agrupar por",
        sort: {
            nameAsc: "Nome (A-Z)",
            nameDesc: "Nome (Z-A)",
            dateNew: "Data (Mais recente)",
            dateOld: "Data (Mais antigo)",
            status: "Status"
        }
      },
      cookie: {
        title: "Segurança e Dados",
        text: "Utilizamos cookies e tecnologias de autenticação para garantir a proteção dos seus dados industriais e conformidade com a ISO 9001 e LGPD.",
        accept: "Aceitar e Entrar"
      },
      menu: {
        main: "Principal",
        home: "Início",
        library: "Biblioteca",
        quickAccess: "Acesso Rápido",
        recent: "Recentes",
        favorites: "Favoritos",
        tickets: "Suporte Técnico",
        dashboard: "Dashboard",
        documents: "Documentos",
        management: "Gestão Corporativa",
        portalName: "Portal da Qualidade",
        brand: "Aços Vital"
      },
      dashboard: {
        hello: "Olá",
        whatLookingFor: "Gerenciamento de Documentos Técnicos",
        searchPlaceholder: "Lote, Corrida ou Nota Fiscal...",
        accountStatus: "Status da Conta",
        verified: "VERIFICADO",
        statusDesc: "Sua conta está ativa e em conformidade documental.",
        libraryTitle: "Repositório de Documentos",
        favoritesTitle: "Acesso Rápido",
        historyTitle: "Histórico",
        ticketsTitle: "Central de Suporte",
        filters: "Filtros Avançados",
        period: "Período",
        clear: "Limpar Filtros",
        openTicket: "Abrir Novo Chamado",
        noTickets: "Sem chamados ativos no momento."
      },
      login: {
        welcomeBack: "Acesso Restrito",
        enterCredentials: "Use suas credenciais fornecidas pela TI Aços Vital.",
        emailLabel: "E-mail Profissional",
        passwordLabel: "Senha de Acesso",
        forgotPassword: "Redefinir Senha",
        accessPortal: "Entrar no Portal",
        sloganTitle: "Conformidade e Rastreabilidade Industrial.",
        sloganText: "Plataforma centralizada para gestão de certificados de qualidade e laudos técnicos Aços Vital S.A."
      },
      roles: {
        ADMIN: "Administrador",
        QUALITY: "Analista de Qualidade",
        CLIENT: "Cliente B2B"
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
