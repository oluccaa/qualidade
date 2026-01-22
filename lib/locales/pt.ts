export const pt = {
  common: {
    welcome: "Bem-vindo",
    loading: "Carregando...",
    syncing: "Sincronizando...",
    privacy: "Privacidade",
    logout: "Sair",
    edit: "Editar",
    save: "Salvar",
    cancel: "Cancelar",
    back: "Voltar",
    na: "N/A",
    status: "Status",
    statusActive: "Ativo",
    statusInactive: "Inativo",
    uploaded: "Upload Concluído",
    updatingDatabase: "Atualizando base de dados...",
    errorLoadingLogs: "Erro ao carregar logs: {{message}}",
    changePassword: "Alterar Senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    close: "Fechar",
    delete: "Excluir",
    language: {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol"
    },
    clear: "Limpar",
    moreOptions: "Mais opções",
    skipToContent: "Pular para o conteúdo",
    retry: "Tentar Novamente",
    success: "Sucesso",
    error: "Erro"
  },
  loaders: {
    preparingPortal: "Preparando o Portal da Qualidade Aços Vital",
    preparingInterface: "Preparando Interface Vital...",
    validatingProtocols: "Validating Security Protocols...",
    syncFailure: "Falha na Sincronização",
    syncingModule: "Sincronizando Módulo...",
    scanningLedger: "Escaneando Ledger...",
    syncingVault: "Sincronizando Vault...",
    syncingBacklog: "Sincronizando Backlog Técnico..."
  },
  audit: {
    workflow: {
      title: "Fluxo Industrial de Auditoria",
      partnerTitle: "Conformidade e Aceite Técnico",
      subtitle: "Controle rigoroso de vereditos industriais.",
      partnerSubtitle: "Verificação e assinatura de certificados homologados.",
      steps: {
        step1: "1. Liberação Vital (SGQ)",
        step2: "2. Conferência de Dados",
        step3: "3. Vistoria de Carga",
        step4: "4. Arbitragem Técnica",
        step5: "5. Veredito do Parceiro",
        step6: "6. Consolidação Digital",
        step7: "7. Protocolo Vital Certificado"
      },
      labels: {
        authFlow: "Autorizar Fluxo Industrial",
        stationAnnotation: "Estação de Anotação Técnica",
        viewNotes: "Visualizar Notas (Leitura)",
        attachDocs: "Anexar Documentação Digitalizada",
        attachDocsDesc: "Utilize este campo se imprimiu o documento para anotar à mão ou se possui um comprovante adicional de divergência.",
        auditFlags: "Flags de Auditoria",
        addFlag: "Adicionar marcador...",
        reportDivergence: "Relatório de Divergências",
        reportDivergencePlaceholder: "Descreva formalmente as observações técnicas sobre este documento...",
        signValidation: "Assinar Validação de Dados",
        galleryField: "Galeria de Campo (Fotos/Documentos)",
        galleryFieldDesc: "Anexe aqui fotos da carga recebida, lacres ou documentos que acompanharam o transporte.",
        physicalState: "Estado Físico (Flags de Recebimento)",
        physicalNotes: "Observações de Campo",
        physicalNotesPlaceholder: "Relate as condições de recepção do material no local...",
        approveLoad: "Aprovar Carga",
        rejectLoad: "Rejeitar Carga",
        fullCompliance: "Conformidade Plena Detectada",
        noDivergence: "Sem divergências impeditivas. Arbitragem concluída automaticamente.",
        arbitrationPlaceholder: "Descreva a mediação técnica final para este lote...",
        signArbitration: "Assinar Arbitragem Técnica",
        vitalMediationNote: "Nota de Mediação Vital",
        acceptBatch: "Aceitar Lote",
        rejectBatch: "Rejeitar Lote",
        clientAcceptance: "Status de Aceite do Cliente",
        homologated: "Lote Homologado",
        refused: "Lote Recusado",
        repPartner: "Representante Parceiro",
        repQuality: "Analista Qualidade",
        signDigitalSealClient: "Assinar Selo Digital (Cliente)",
        signDigitalSealAnalyst: "Assinar Selo Digital (Analista)",
        vitalCertification: "Certificação Vital SGQ",
        homologatedAsset: "Ativo homologado para uso industrial seguro.",
        transmissionBlocked: "Transmissão Bloqueada",
        rejectedByPartner: "Lote rejeitado pelo parceiro. O workflow exige mediação técnica externa.",
        criticalDivergence: "Divergência técnica crítica detectada. Aguarde contato da Qualidade Aços Vital.",
        partnerContact: "Contato do Parceiro (Representante)",
        digitalSignature: "Assinatura Digital Auditada",
        signed: "Assinado",
        waiting: "Aguardando...",
        completion: "Conclusão das 7 Etapas",
        protocolValidated: "Protocolo Validado",
        phaseAnalysis: "Fase em Análise",
        awaitingRelease: "Aguardando Liberação"
      },
      messages: {
        signSuccess: "Protocolo assinado com sucesso.",
        syncError: "Erro na sincronização técnica.",
        evidenceSuccess: "Evidência arquivada com sucesso.",
        noImages: "Sem Imagens Anexadas"
      }
    },
    metrics: {
      referenceId: "ID de Referência",
      assetVersion: "Versão do Ativo",
      partnerCompany: "Empresa Parceira",
      vitalManager: "Responsável Vital",
      clientUser: "Usuário Cliente",
      auditWindow: "Janela de Auditoria",
      cycleStart: "Início do Ciclo",
      techConclusion: "Conclusão Técnica"
    }
  },
  settings: {
    title: "Preferências do Perfil",
    subtitle: "Gerencie suas diretrizes de segurança e protocolos de acesso.",
    securityCompliance: "Segurança e Conformidade",
    techId: "ID TÉCNICO",
    changePassDesc: "Atualize seu segredo de autenticação periodicamente para manter a integridade da conta.",
    privacyDesc: "Consulte como seus dados técnicos e registros de auditoria são processados no portal."
  },
  auth: {
    errors: {
      invalidCredentials: "E-mail ou senha inválidos.",
      samePassword: "A nova senha deve ser diferente da senha antiga.",
      weakPassword: "A senha fornecida não atende aos requisitos de complexidade.",
      tooManyRequests: "Muitas tentativas de acesso. Tente novamente em alguns instantes.",
      unexpected: "Ocorreu um erro técnico inesperado.",
      sessionExpired: "Sua sessão expirou. Por favor, identifique-se novamente."
    }
  },
  login: {
    title: "Portal da Qualidade",
    subtitle: "SISTEMA DE GESTÃO DA QUALIDADE",
    corpEmail: "E-mail Corporativo",
    accessPassword: "Senha de Acesso",
    forgotPassword: "Esqueceu a senha?",
    authenticate: "Autenticação Segura",
    authenticateAccess: "Autenticação Segura",
    enterCredentials: "Use suas credenciais corporativas autorizadas pela Aços Vital.",
    heroSubtitle: "Repositório centralizado para documentação técnica e certificados de qualidade. Precisão industrial em cada registro.",
    footerNote: "SISTEMAS MONITORADOS • PRIVACIDADE COMPLIANCE • © 2026 AÇOS VITAL",
    slogan: "Aço de confiança, qualidade certificada",
    certification: "QUALIDADE TÉCNICA CERTIFICADA",
    secureData: "LINK B2B CRIPTOGRAFADO",
    monitoring: "MONITOREO DE SISTEMAS EM TEMPO REAL",
    error: "Falha na autenticação do portal.",
    restrictedAccess: "Acesso Restrito",
    identifyToAccess: "Identifique-se para acessar o painel de certificados seguro.",
    accessManagedByVital: "A Aços Vital gerencia sua governança de acesso internamente.",
    successTitle: "Acesso Concedido!",
    successSubtitle: "Redirecionando para o Gateway de Segurança...",
    connectionError: "Falha de conexão com o servidor de segurança."
  },
  signup: {
    passwordPlaceholder: "Mín. 8 caracteres"
  },
  admin: {
    tabs: {
      overview: "Visão Geral",
      users: "Usuários",
      logs: "Logs",
      settings: "Configurações"
    },
    stats: {
      totalUsers: "Registros de Identidade",
      organizations: "Parceiros Ativos",
      activities: "Operações (24h)",
      activeClientsSummary: "{{count}} empresas na carteira",
      logsLast24hSummary: "{{count}} eventos registrados",
      headers: {
        timestamp: "Data/Hora",
        user: "Operador",
        action: "Operação",
        target: "Resumo",
        ip: "IP de Origem",
        severity: "Nível"
      }
    },
    users: {
      identity: "Identidade",
      role: "Privilégios",
      roleLabel: "Nível de Acesso",
      department: "Unidade",
      createTitle: "Novas Credenciais de Acesso",
      editTitle: "Modificar Perfil",
      name: "Nome Completo Legal",
      email: "Identidade Corporativa",
      org: "Entidade Parceira",
      filters: "Filtrar por"
    },
    clients: {
      createTitle: "Nova Identidade de Parceiro",
      editTitle: "Modificar Parceiro"
    },
    logs: {
      allSeverities: "Todas as Severidades",
      severity: {
        INFO: "Informativo",
        WARNING: "Aviso",
        ERROR: "Erro",
        CRITICAL: "Crítico"
      }
    }
  },
  quality: {
    overview: "Insight Center",
    myAuditLog: "Forensic Audit Log",
    activePortfolio: "Carteira Ativa",
    pendingDocs: "Urgência Técnica",
    complianceISO: "Indice de Conformidade Vital",
    searchClient: "Buscar entidade por nome ou CNPJ...",
    newClientUser: "Nova Identidade de Parceiro",
    newCompany: "Nova Entidade Parceira",
    allActivities: "Buscar logs por usuário, ação ou IP...",
    errorLoadingClients: "Falha ao recuperar dados do portfólio.",
    errorLoadingQualityData: "Falha na sincronização de indicadores de qualidade.",
    noQualityLogsFound: "Nenhum log de auditoria técnica detectado.",
    invalidConfirmationCredentials: "Falha na autenticação para confirmação.",
    releaseTransmission: "Autorizar Transmissão",
    releaseTransmissionSuccess: "Protocolo Vital ativado para o cliente.",
    contestVerdict: "Argumentação Técnica",
    contestVerdictSuccess: "Contestação enviada ao cliente.",
    contestedBanner: "Veredito em contestação. Contate o analista via e-mail.",
    releasedBy: "Liberado por",
    documentalCheck: "Check Documental",
    physicalCheck: "Check Físico",
    technicalObservations: "Observações Técnicas",
    flagsPlaceholder: "Adicionar flag...",
    approve: "Aprovar",
    reject: "Rejeitar",
    uploadEvidence: "Upload de Evidência",
    dragAndDrop: "Arraste e solte imagens de evidência aqui",
    inspectionLocked: "Fase bloqueada por dependência de fluxo"
  },
  roles: {
    ADMIN: "Administrador do Sistema",
    QUALITY: "Analista de Qualidade Técnica",
    CLIENT: "Parceiro"
  },
  dashboard: {
    status: {
      monitoringActive: "SISTEMAS SOB MONITORAMENTO"
    },
    kpi: {
      libraryLabel: "Início",
      activeDocsSubtext: "Certificados Verificados",
      recent: "Recentes",
      viewedToday: "Vistos Hoje",
      compliance: "Conformidade",
      assured: "VALIDADA",
      qualityAssured: "Gestão Vital"
    },
    exploreAll: "Expandir Portfólio",
    fileStatusTimeline: "Ciclo de Vida de Conformidade do Ativo",
    organization: "Entidade Corporativa",
    fiscalID: "CNPJ",
    contractDate: "Início do Ciclo de Vida",
    recentCertificates: "Certificados Recentes",
    complianceStatus: "Estado de Conformidade",
    certifiedOperation: "Operação Certificada",
    vitalStandard: "PADRÃO AÇOS VITAL",
    traceability: "Rastreabilidade",
    disclaimer: "Todos os certificados exibidos neste portal foram validados pelo laboratório técnico da Aços Vital.",
    available: "Available",
    noRecentFiles: "Nenhum arquivo recente encontrado.",
    criticalPendencies: "Pendências Críticas",
    lastAnalysis: "Última Análise",
    allClients: "Todos os Clientes",
    activeClients: "Clientes Ativos"
  },
  client: {
    home: "Início",
    flux: "Fluxo",
    portal: {
      title: "Terminal do Parceiro",
      libraryTitle: "Repositório de Ativos",
      auditTitle: "Gestão de Conformidade",
      gatewayActive: "Gateway B2B Ativo",
      exclusiveTerminal: "Seu terminal exclusivo de certificação industrial.",
      flowTitle: "Monitoramento de Fluxo",
      flowSubtitle: "Status de conferência física e documental em tempo real"
    },
    dashboard: {
      loading: "Sincronizando Dados B2B...",
      pendingActions: "Ações Pendentes",
      requireReview: "Requer Conferência",
      validatedAssets: "Ativos Validados",
      complianceSubtitle: "Protocolos em Conformidade",
      lastAudit: "Última Auditoria",
      protocolLabel: "Protocolo Vital SGQ",
      recentHistory: "Histórico de Ativos Recebidos",
      accessLibrary: "Acessar Biblioteca",
      noRecent: "Sem movimentações recentes no Vault.",
      auditAsset: "Auditar Ativo"
    },
    library: {
      title: "Biblioteca de Ativos",
      subtitle: "Arquivos técnicos e certificados industriais",
      totalAssets: "Recursos: {{count}}",
      vaultLabel: "Vault Vital"
    }
  },
  cookie: {
    title: "Privacidade e Proteção de Dados",
    text: "Utilizamos cookies essenciais para garantir a segurança da sessão e a integridade dos certificados técnicos. Ao continuar navegando no portal Aços Vital, você reconhece nossa política de governança de dados.",
    accept: "Reconhecer e Continuar"
  },
  menu: {
    dashboard: "Início",
    library: "Biblioteca de arquivos",
    certificates: "Certificados",
    management: "Governança de Acesso",
    qualityManagement: "Conformidade de Qualidade",
    portalName: "Portal da Qualidade",
    brand: "Aços Vital",
    systemMonitoring: "MONITOREO DE SISTEMAS EM TEMPO REAL",
    settings: "Preferências do Perfil",
    sections: {
      main: "Navegação Principal",
      documents: "Gestão de Documentos",
      operational: "Módulos Operacionais",
      governance: "Segurança e Governança"
    }
  },
  files: {
    authenticatingAccess: "Autorizando Solicitação...",
    authenticatingLayers: "Validating Security Layers...",
    authenticatedView: "Viewport Verificado",
    errorLoadingDocument: "Falha ao renderizar recurso técnico.",
    errorLoadingFiles: "Erro de sincronização de recursos.",
    openInNewTab: "Ver Recurso Completo",
    pending: "Aguardando Auditoria Técnica",
    groups: {
      approved: "Conforme / Aprovado",
      rejected: "Não Conforme / Rejeitado"
    },
    sort: {
      nameAsc: "Lexicográfico (A-Z)"
    },
    searchPlaceholder: "Pesquisar certificados, lotes ou pastas...",
    listView: "Lista Detalhada",
    gridView: "Grade de Ícones",
    itemSelected: "recurso identificado",
    itemsSelected: "recursos identificados",
    processingFiles: "Executando análise de recursos...",
    upload: {
      title: "Upload Seguro",
      button: "Importar",
      selectFile: "Selecione o recurso técnico",
      chooseFile: "Procurar arquivos",
      fileName: "Descritor do recurso",
      fileNamePlaceholder: "Ex: Material_Spec_Batch123.pdf",
      uploadButton: "Inicializar Upload",
      noFileSelected: "Nenhum recurso identificado.",
      fileNameRequired: "Descritor é obrigatório para rastreabilidade.",
      success: "Recurso sincronizado com sucesso!",
      noOrgLinked: "Usuário órfão. Importação de recursos desativada."
    },
    createFolder: {
      title: "Novo Diretório Estrutural",
      button: "Novo Diretório",
      folderName: "Descritor do diretório",
      folderNamePlaceholder: "Ex: Registros_Lote_2024",
      createButton: "Inicializar Diretório",
      nameRequired: "Descritor de diretório é obrigatório.",
      success: "Diretório inicializado com sucesso!",
      noOrgLinked: "Usuário órfão. Criação de diretório desativada."
    },
    rename: {
      title: "Modificar Descritor",
      newName: "Novo descritor",
      newNamePlaceholder: "Digite o novo valor",
      renameButton: "Aplicar Alterações",
      nameRequired: "O valor do descritor é obrigatório.",
      success: "Recurso atualizado com sucesso!"
    },
    delete: {
      confirmTitle: "Remoção de Recurso",
      confirmMessage: "Executar remoção permanente de {{count}} item(s) selecionado(s)? Esta operação é imutável e auditada.",
      button: "Executar Remoção",
      success: "Itens excluídos permanentemente do cluster."
    },
    downloadButton: "Exportar PDF",
    selectItem: "Alvo {{name}}",
    noResultsFound: "Nenhum ativo corresponde à consulta.",
    typeToSearch: "Comece a digitar para filtrar recursos...",
    traceability: "Rastreabilidade por Lote ou Descritor..."
  },
  changePassword: {
    title: "Segurança de Acesso",
    current: "Credencial Existente",
    currentError: "A senha atual fornecida está incorreta.",
    new: "Novo Segredo Técnico",
    confirm: "Validar Novo Segredo",
    matchError: "As credenciais não coincidem.",
    success: "Senha atualizada com sucesso!",
    errorUpdatingPassword: "Falha no serviço de atualização de credenciais.",
    submit: "Aplicar Política de Segurança",
    requirements: {
      length: "Pelo menos 8 caracteres",
      upper: "Uma letra maiúscula",
      number: "Um número (0-9)",
      special: "Um caractere especial (@#$!*)"
    }
  },
  privacy: {
    title: "Governança de Dados e Privacidade",
    subtitle: "Conformidade Regulatória e Estrutura de Segurança",
    close: "Ciente",
    viewPolicy: "Ver Política",
    section1: "Escopo da Plataforma",
    section1_content: "O Portal da Qualidade Aços Vital é uma plataforma B2B para gestão de documentos técnicos e certificados de qualidade. Esta política esclarece a conformidade com as Normas Técnicas e as leis de proteção de dados atuais (LGPD/GDPR).",
    section2: "Dados Coletados",
    section2_item1: "Identificação: Nome e e-mail corporativo.",
    section2_item2: "Corporativo: CNPJ e histórico de contrato.",
    section2_item3: "Auditoria: Logs de IP e ações do usuário (visualização/download).",
    section3: "Criptografia e Armazenamento",
    section3_content: "Utilizamos criptografia TLS 1.2+ e segregação estrita por organização (Multi-tenant). Seus documentos nunca são acessíveis por outras empresas do portfólio."
  },
  notifications: {
    title: "Alertas Operacionais",
    markAllAsRead: "Limpar todos os alertas",
    markedAsRead: "Alerta arquivado.",
    markedAllAsRead: "Fila de alertas limpa.",
    emptyState: "Status do sistema: Nominal. Sem alertas.",
    loading: "Sincronizando alertas...",
    errorLoading: "Falha na sincronização de alertas: {{message}}",
    errorMarkingAsRead: "Falha ao arquivar alerta: {{message}}",
    errorMarkingAllAsRead: "Falha ao limpar alertas: {{message}}",
  },
  maintenance: {
    title: "Manutenção do Sistema",
    message: "O gateway de segurança está passando por atualizações técnicas planejadas para melhorar o desempenho da visualização de certificados.",
    returnEstimate: "Retorno Estimado",
    todayAt: "Hoje às {{time}}",
    soon: "Em breve",
    retry: "Repetir Conexão",
    contact: "Contatar Suporte",
    systemId: "Vital Cloud Engine v2.4.0"
  },
  maintenanceSchedule: {
    title: "Agendar Manutenção",
    eventTitle: "Descrição do Evento",
    eventTitlePlaceholder: "Ex: Upgrade do Cluster de Arquivos",
    date: "Data Prevista",
    time: "Hora de Início",
    duration: "Downtime Estimado (min)",
    customMessage: "Comunicado aos Usuários",
    scheduleButton: "Confirmar Janela",
    scheduledSuccess: "Manutenção '{{title}}' agendada com sucesso.",
    scheduledError: "Falha no agendamento: {{message}}"
  }
};