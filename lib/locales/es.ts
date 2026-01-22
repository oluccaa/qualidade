import { pt } from './pt.ts';

export const es: typeof pt = {
  common: {
    welcome: "Bienvenido",
    loading: "Cargando...",
    syncing: "Sincronizando...",
    privacy: "Privacidad",
    logout: "Cerrar sesión",
    edit: "Editar",
    save: "Guardar",
    cancel: "Cancelar",
    back: "Atrás",
    na: "N/D",
    status: "Estado",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    uploaded: "Subida completada",
    updatingDatabase: "Actualizando base de datos...",
    errorLoadingLogs: "Error al cargar registros: {{message}}",
    changePassword: "Cambiar contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    close: "Cerrar",
    delete: "Eliminar",
    language: {
      pt: "Portugués",
      en: "Inglés",
      es: "Español"
    },
    clear: "Limpiar",
    moreOptions: "Más opciones",
    skipToContent: "Saltar al contenido",
    retry: "Reintentar",
    success: "Éxito",
    error: "Error"
  },
  loaders: {
    preparingPortal: "Preparando el Portal de Calidad Aços Vital",
    preparingInterface: "Preparando Interfaz Vital...",
    validatingProtocols: "Validando Protocolos de Seguridad...",
    syncFailure: "Fallo de Sincronización",
    syncingModule: "Sincronizando Módulo...",
    scanningLedger: "Escaneando Ledger...",
    syncingVault: "Sincronizando Vault...",
    syncingBacklog: "Sincronizando Backlog Técnico..."
  },
  audit: {
    workflow: {
      title: "Flujo Industrial de Auditoría",
      partnerTitle: "Cumplimiento y Aceptación Técnica",
      subtitle: "Control riguroso de veredictos industriales.",
      partnerSubtitle: "Verificación y firma de certificados homologados.",
      steps: {
        step1: "1. Liberación Vital (SGC)",
        step2: "2. Verificación de Datos",
        step3: "3. Inspección Física",
        step4: "4. Arbitraje Técnico",
        step5: "5. Veredicto del Socio",
        step6: "6. Consolidación Digital",
        step7: "7. Protocolo Vital Certificado"
      },
      labels: {
        authFlow: "Autorizar Flujo Industrial",
        stationAnnotation: "Estación de Anotación Técnica",
        viewNotes: "Ver Notas (Lectura)",
        attachDocs: "Adjuntar Documentación Escaneada",
        attachDocsDesc: "Utilice este campo si imprimió el documento para tomar notas a mano o si tiene evidencia adicional de discrepancia.",
        auditFlags: "Marcadores de Auditoría",
        addFlag: "Añadir marcador...",
        reportDivergence: "Informe de Discrepancias",
        reportDivergencePlaceholder: "Describa formalmente las observaciones técnicas sobre este documento...",
        signValidation: "Firmar Validación de Datos",
        galleryField: "Galería de Campo (Fotos/Documentos)",
        galleryFieldDesc: "Adjunte aquí fotos de la carga recibida, sellos o documentos que acompañan al transporte.",
        physicalState: "Estado Físico (Marcadores de Recepción)",
        physicalNotes: "Observaciones de Campo",
        physicalNotesPlaceholder: "Reporte las condiciones de recepción del material en el sitio...",
        approveLoad: "Aprobar Carga",
        rejectLoad: "Rechazar Carga",
        fullCompliance: "Cumplimiento Total Detectado",
        noDivergence: "Sin discrepancias impeditivas. Arbitraje completado automáticamente.",
        arbitrationPlaceholder: "Describa la mediación técnica final para este lote...",
        signArbitration: "Firmar Arbitraje Técnico",
        vitalMediationNote: "Nota de Mediación Vital",
        acceptBatch: "Aceptar Lote",
        rejectBatch: "Rechazar Lote",
        clientAcceptance: "Estado de Aceptación del Cliente",
        homologated: "Lote Homologado",
        refused: "Lote Rechazado",
        repPartner: "Representante del Socio",
        repQuality: "Analista de Calidad",
        signDigitalSealClient: "Firmar Sello Digital (Cliente)",
        signDigitalSealAnalyst: "Firmar Sello Digital (Analista)",
        vitalCertification: "Certificación Vital SGQ",
        homologatedAsset: "Activo homologado para uso industrial seguro.",
        transmissionBlocked: "Transmisión Bloqueada",
        rejectedByPartner: "Lote rechazado por el socio. El flujo requiere mediación técnica externa.",
        criticalDivergence: "Discrepancia técnica crítica detectada. Espere contacto de Calidad Aços Vital.",
        partnerContact: "Contacto del Socio (Representante)",
        digitalSignature: "Firma Digital Auditada",
        signed: "Firmado",
        waiting: "Esperando...",
        completion: "Conclusión de los 7 Pasos",
        protocolValidated: "Protocolo Validado",
        phaseAnalysis: "Fase en Análisis",
        awaitingRelease: "Esperando Liberación"
      },
      messages: {
        signSuccess: "Protocolo firmado con éxito.",
        syncError: "Error de sincronización técnica.",
        evidenceSuccess: "Evidencia archivada con éxito.",
        noImages: "Sin Imágenes Adjuntas"
      }
    },
    metrics: {
      referenceId: "ID de Referencia",
      assetVersion: "Versión del Activo",
      partnerCompany: "Empresa Asociada",
      vitalManager: "Responsable Vital",
      clientUser: "Usuario Cliente",
      auditWindow: "Ventana de Auditoría",
      cycleStart: "Inicio del Ciclo",
      techConclusion: "Conclusión Técnica"
    }
  },
  settings: {
    title: "Preferencias del Perfil",
    subtitle: "Gestione sus pautas de seguridad y protocolos de acceso.",
    securityCompliance: "Seguridad y Cumplimiento",
    techId: "ID TÉCNICO",
    changePassDesc: "Actualice su clave de autenticación periódicamente para mantener la integridad de la cuenta.",
    privacyDesc: "Consulte cómo se procesan sus datos técnicos y registros de auditoría en el portal."
  },
  auth: {
    errors: {
      invalidCredentials: "Correo electrónico o contraseña incorrectos.",
      samePassword: "La nueva contraseña debe ser diferente de la antigua.",
      weakPassword: "La contraseña proporcionada no cumple con los requisitos de complejidad.",
      tooManyRequests: "Demasiados intentos de acceso. Inténtelo de nuevo en unos momentos.",
      unexpected: "Ocurrió un error técnico inesperado.",
      sessionExpired: "Su sesión ha expirado. Por favor, identifíquese de nuevo."
    }
  },
  login: {
    title: "Portal de Calidad",
    subtitle: "SISTEMA DE GESTIÓN DE CALIDAD",
    corpEmail: "Identidad Corporativa",
    accessPassword: "Clave de Acceso",
    forgotPassword: "¿Olvidó su clave?",
    authenticate: "Autenticación Segura",
    authenticateAccess: "Autenticación Segura",
    enterCredentials: "Utilice sus credenciales corporativas autorizadas por Aços Vital.",
    heroSubtitle: "Repositorio central de documentación técnica y certificados. Precisión industrial en cada registro.",
    footerNote: "SISTEMAS MONITORIZADOS • CUMPLIMIENTO DE PRIVACIDAD • © 2026 AÇOS VITAL",
    slogan: "Acero de confianza, calidad certificada",
    certification: "CALIDAD TÉCNICA CERTIFICADA",
    secureData: "ENLACE B2B ENCRIPTADO",
    monitoring: "MONITOREO DE SISTEMAS EN TIEMPO REAL",
    error: "Error de autenticación.",
    restrictedAccess: "Acceso Restringido",
    identifyToAccess: "Identifíquese para acceder al panel de certificados seguro.",
    accessManagedByVital: "Aços Vital gestiona su gobernanza de acceso internamente.",
    successTitle: "¡Acceso Concedido!",
    successSubtitle: "Redireccionando al Gateway de Segurança...",
    connectionError: "Fallo de conexión con el servidor de seguridad."
  },
  signup: {
    passwordPlaceholder: "Mín. 8 caracteres"
  },
  admin: {
    tabs: {
      overview: "Vista General",
      users: "Usuarios",
      logs: "Registros",
      settings: "Configuración"
    },
    stats: {
      totalUsers: "Registros de Identidad",
      organizations: "Entidades Asociadas",
      activities: "Operaciones (24h)",
      activeClientsSummary: "{{count}} empresas en cartera",
      logsLast24hSummary: "{{count}} eventos registrados",
      headers: {
        timestamp: "Fecha/Hora",
        user: "Operador",
        action: "Operación",
        target: "Recurso",
        ip: "IP de Origen",
        severity: "Nivel"
      }
    },
    users: {
      identity: "Identity",
      role: "Privilegios",
      roleLabel: "Nivel de Acceso",
      department: "Unidad",
      createTitle: "Nueva Credencial de Acceso",
      editTitle: "Modificar Perfil",
      name: "Nombre Legal Completo",
      email: "Identidad Corporativa",
      org: "Entidad Asociada",
      filters: "Filtrar por"
    },
    clients: {
      createTitle: "Nueva Identidad Corporativa",
      editTitle: "Modificar Entidad"
    },
    logs: {
      allSeverities: "Todas las Severidades",
      severity: {
        INFO: "Informativo",
        WARNING: "Aviso",
        ERROR: "Error",
        CRITICAL: "Crítico"
      }
    }
  },
  quality: {
    overview: "Centro de Información",
    myAuditLog: "Registro de Auditoría Forense",
    activePortfolio: "Cartera Activa",
    pendingDocs: "Pendientes de Auditoría",
    complianceISO: "Índice de Cumplimiento Técnico",
    searchClient: "Buscar entidad por nombre o ID Fiscal...",
    newClientUser: "Nueva Identidad de Socio",
    newCompany: "Nueva Identidad Corporativa",
    allActivities: "Buscar registros por usuario, acción o IP...",
    errorLoadingClients: "Error al recuperar datos de la cartera.",
    errorLoadingQualityData: "Fallo en la sincronización de indicadores de calidad.",
    noQualityLogsFound: "No se detectaron registros de auditoría técnica.",
    invalidConfirmationCredentials: "Error en la autenticación de confirmación.",
    releaseTransmission: "Liberar Transmisión",
    releaseTransmissionSuccess: "Transmisión liberada al cliente.",
    contestVerdict: "Contestar Veredicto",
    contestVerdictSuccess: "Contestación enviada al cliente.",
    contestedBanner: "Veredito en Disputa. Contacte al analista por correo.",
    releasedBy: "Liberado por",
    documentalCheck: "Control Documental",
    physicalCheck: "Control Físico",
    technicalObservations: "Observaciones Técnicas",
    flagsPlaceholder: "Añadir marcador...",
    approve: "Aprobar",
    reject: "Rechazar",
    uploadEvidence: "Subir Evidencia",
    dragAndDrop: "Arrastre y suelte imágenes de evidencia aquí",
    inspectionLocked: "Esperando liberación de Calidad"
  },
  roles: {
    ADMIN: "Administrador del Sistema",
    QUALITY: "Analista de Calidad Técnico",
    CLIENT: "Socio"
  },
  dashboard: {
    status: {
      monitoringActive: "SISTEMAS BAJO MONITOREO"
    },
    kpi: {
      libraryLabel: "Inicio",
      activeDocsSubtext: "Certificados Verificados",
      recent: "Recientes",
      viewedToday: "Vistos Hoy",
      compliance: "Conformidad",
      assured: "VALIDADA",
      qualityAssured: "Gestão Vital"
    },
    exploreAll: "Expandir Cartera",
    fileStatusTimeline: "Ciclo de Vida del Cumplimiento",
    organization: "Razón Social",
    fiscalID: "ID Fiscal (CNPJ)",
    contractDate: "Inicio de Vigencia",
    recentCertificates: "Certificados Recientes",
    complianceStatus: "Estado de Conformidad",
    certifiedOperation: "Operación Certificada",
    vitalStandard: "ESTÁNDAR AÇOS VITAL",
    traceability: "Trazabilidad",
    disclaimer: "Todos los certificados mostrados en este portal han sido validados por el laboratorio técnico de Aços Vital.",
    available: "Disponible",
    noRecentFiles: "No hay archivos recientes.",
    criticalPendencies: "Pendencias Críticas",
    lastAnalysis: "Último Análisis",
    allClients: "Todos los Clientes",
    activeClients: "Clientes Activos"
  },
  client: {
    home: "Inicio",
    flux: "Flujo",
    portal: {
      title: "Terminal de Socio",
      libraryTitle: "Repositorio de Ativos",
      auditTitle: "Gestión de Cumplimiento",
      gatewayActive: "B2B Gateway Ativo",
      exclusiveTerminal: "Su terminal exclusivo de certificación industrial.",
      flowTitle: "Monitoreo de Flujo",
      flowSubtitle: "Estado de verificación física y documental en tiempo real"
    },
    dashboard: {
      loading: "Sincronizando Datos B2B...",
      pendingActions: "Acciones Pendientes",
      requireReview: "Revisión Requerida",
      validatedAssets: "Activos Validados",
      complianceSubtitle: "Protocolos en Cumplimiento",
      lastAudit: "Última Auditoría",
      protocolLabel: "Protocolo Vital SGQ",
      recentHistory: "Historial de Activos Recibidos",
      accessLibrary: "Acceder a Biblioteca",
      noRecent: "Sin movimientos recientes en el Vault.",
      auditAsset: "Auditar Ativo"
    },
    library: {
      title: "Biblioteca de Activos",
      subtitle: "Archivos técnicos y certificados industriales",
      totalAssets: "Recursos: {{count}}",
      vaultLabel: "Vital Vault"
    }
  },
  cookie: {
    title: "Privacidade y Protección de Datos",
    text: "Utilizamos cookies esenciales para garantizar la seguridad de la sesión y la integridad de los certificados técnicos. Al continuar navegando, acepta nuestra política de gobernanza de datos.",
    accept: "Aceptar y Continuar"
  },
  menu: {
    dashboard: "Inicio",
    library: "Biblioteca de Activos",
    certificates: "Certificados",
    management: "Gobernanza de Acceso",
    qualityManagement: "Cumplimiento de Calidad",
    portalName: "Portal de Calidad",
    brand: "Aços Vital",
    systemMonitoring: "MONITOREO DE INFRAESTRUCTURA",
    settings: "Preferencias de Perfil",
    sections: {
      main: "Navegação Principal",
      documents: "Gestión Documental",
      operational: "Módulos Operacionais",
      governance: "Governança e Segurança"
    }
  },
  files: {
    authenticatingAccess: "Autorizando Solicitud...",
    authenticatingLayers: "Autenticando Capas de Segurança...",
    authenticatedView: "Visor Verificado",
    errorLoadingDocument: "Error al renderizar el recurso técnico.",
    errorLoadingFiles: "Error de sincronización de recursos.",
    openInNewTab: "Ver Recurso Completo",
    pending: "Esperando Auditoría Técnica",
    groups: {
      approved: "Conforme / Aprovado",
      rejected: "No Conforme / Rechazado"
    },
    sort: {
      nameAsc: "Lexicográfico (A-Z)"
    },
    searchPlaceholder: "Buscar certificados, lotes o carpetas...",
    listView: "Lista Estructurada",
    gridView: "Cuadrícula Dinámica",
    itemSelected: "recurso identificado",
    itemsSelected: "recursos identificados",
    processingFiles: "Ejecutando análisis de recursos...",
    upload: {
      title: "Carga Segura",
      button: "Importar",
      selectFile: "Seleccione recurso de origen",
      chooseFile: "Explorar archivos",
      fileName: "Descriptor de recurso",
      fileNamePlaceholder: "Ej: Espec_Material_Lote123.pdf",
      uploadButton: "Iniciar Carga",
      noFileSelected: "Ningún recurso identificado.",
      fileNameRequired: "El descriptor es obligatorio para trazabilidad.",
      success: "¡Recurso sincronizado con éxito!",
      noOrgLinked: "Usuario huérfano. Importación de recursos deshabilitada."
    },
    createFolder: {
      title: "Nuevo Directorio Estructural",
      button: "Nuevo Directorio",
      folderName: "Descriptor de directorio",
      folderNamePlaceholder: "Ej: Registros_Lote_2024",
      createButton: "Inicializar Directorio",
      nameRequired: "El descriptor de directorio é obligatorio.",
      success: "¡Directorio inicializado con éxito!",
      noOrgLinked: "Usuario huérfano. Creación de directorios deshabilitada."
    },
    rename: {
      title: "Modificar Descriptor",
      newName: "Nuevo descriptor",
      newNamePlaceholder: "Ingrese nuevo valor",
      renameButton: "Aplicar Cambios",
      nameRequired: "El valor del descriptor es obligatorio.",
      success: "¡Recurso actualizado con éxito!"
    },
    delete: {
      confirmTitle: "Eliminación de Recurso",
      confirmMessage: "¿Ejecutar eliminación permanente de {{count}} elemento(s)? Esta operación es inmutable y auditada.",
      button: "Ejecutar Eliminación",
      success: "Elementos eliminados permanentemente del clúster."
    },
    downloadButton: "Exportar PDF",
    selectItem: "Objetivo {{name}}",
    noResultsFound: "Ningún activo coincide con la consulta.",
    typeToSearch: "Escriba para filtrar recursos...",
    traceability: "Trazabilidad por Lote o Descriptor..."
  },
  changePassword: {
    title: "Segurança de Acesso",
    current: "Senha Atual",
    currentError: "A senha atual informada está incorreta.",
    new: "Nova Senha Técnica",
    confirm: "Confirmar Nova Senha",
    matchError: "As senhas não conferem.",
    success: "¡Contraseña actualizada con éxito!",
    errorUpdatingPassword: "Fallo en el servicio de actualización de credenciales.",
    submit: "Aplicar Política de Seguridad",
    requirements: {
      length: "Al menos 8 caracteres",
      upper: "Una letra mayúscula",
      number: "Un número (0-9)",
      special: "Un carácter especial (@#$!*)"
    }
  },
  privacy: {
    title: "Gobernanza de Datos y Privacidad",
    subtitle: "Cumplimiento Regulatorio y Marco de Seguridad",
    close: "Entendido",
    viewPolicy: "Ver Política",
    section1: "Alcance de la Plataforma",
    section1_content: "El Portal de Calidad Aços Vital es una plataforma B2B para la gestión de documentos técnicos y certificados de calidad. Esta política aclara el cumplimiento de las Normas Técnicas y las leyes de protección de datos vigentes.",
    section2: "Datos Recopilados",
    section2_item1: "Identificación: Nombre y correo electrónico corporativo.",
    section2_item2: "Corporativo: Identificación fiscal (CNPJ) e historial contractual.",
    section2_item3: "Auditoria: Registros de IP y acciones de usuario (ver/descargar).",
    section3: "Cifrado y Almacenamiento",
    section3_content: "Utilizamos cifrado TLS 1.2+ y segregación estrita por organização (Multi-tenant). Sus documentos nunca son accesibles para otras empresas del portafolio."
  },
  notifications: {
    title: "Alertas Operativas",
    markAllAsRead: "Archivar todas las alertas",
    markedAsRead: "Alerta archivada.",
    markedAllAsRead: "Cola de alertas despejada.",
    emptyState: "Estado del sistema: Nominal. Sin alertas.",
    loading: "Sincronizando alertas...",
    errorLoading: "Fallo en la sincronización: {{message}}",
    errorMarkingAsRead: "Fallo al archivar alerta: {{message}}",
    errorMarkingAllAsRead: "Fallo al despejar alertas: {{message}}",
  },
  maintenance: {
    title: "Mantenimiento de Sistemas",
    message: "La pasarela de seguridad está experimentando actualizaciones técnicas planificadas para mejorar el rendimiento de la visualización de certificados.",
    returnEstimate: "Estimación de Retorno",
    todayAt: "Hoy a las {{time}}",
    soon: "Pronto",
    retry: "Reintentar Conexión",
    contact: "Contactar Soporte",
    systemId: "Vital Cloud Engine v2.4.0"
  },
  maintenanceSchedule: {
    title: "Programar Mantenimiento",
    eventTitle: "Identificador del Evento",
    eventTitlePlaceholder: "Ej: Actualización del Clúster de Archivos",
    date: "Fecha Prevista",
    time: "Hora de Inicio",
    duration: "Duración Estimada (minutos)",
    customMessage: "Comunicado a los Usuarios",
    scheduleButton: "Confirmar Ventana",
    scheduledSuccess: "Mantenimiento '{{title}}' programado con éxito.",
    scheduledError: "Fallo al programar mantenimiento: {{message}}"
  }
};