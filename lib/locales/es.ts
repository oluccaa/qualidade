
export const es = {
  common: {
    welcome: "Bienvenido",
    loading: "Cargando...",
    syncing: "Sincronizando...",
    privacy: "Privacidad",
    logout: "Cerrar sesión",
    edit: "Editar",
    save: "Guardar",
    cancel: "Cancelar",
    back: "Volver",
    na: "N/D",
    status: "Estado",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    uploaded: "Carga Finalizada",
    updatingDatabase: "Actualizando base de datos...",
    errorLoadingLogs: "Error al cargar logs: {{message}}",
    changePassword: "Cambiar Contraseña",
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
    syncFailure: "Fallo en la Sincronización",
    syncingModule: "Sincronizando Módulo...",
    scanningLedger: "Escaneando Ledger...",
    syncingVault: "Sincronizando Vault...",
    syncingBacklog: "Sincronizando Backlog Técnico..."
  },
  audit: {
    workflow: {
      title: "Flujo Industrial de Auditoría",
      partnerTitle: "Conformidad y Aceptación Técnica",
      subtitle: "Control riguroso de veredictos industriales.",
      partnerSubtitle: "Verificación y firma de certificados homologados.",
      steps: {
        step1: "1. Triaje Inicial (SGC)",
        step2: "2. Verificación de Datos",
        step3: "3. Inspección de Carga",
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
        attachDocsDesc: "Use este campo si imprimió el documento para anotar a mano o si tiene un comprobante adicional de discrepancia.",
        auditFlags: "Banderas de Auditoría",
        addFlag: "Agregar marcador...",
        reportDivergence: "Informe de Discrepancias",
        reportDivergencePlaceholder: "Describa formalmente las observaciones técnicas sobre este documento...",
        signValidation: "Firmar Validación de Datos",
        galleryField: "Galería de Campo (Fotos/Documentos)",
        galleryFieldDesc: "Adjunte aquí fotos de la carga recibida, precintos o documentos que acompañaron el transporte.",
        physicalState: "Estado Físico (Banderas de Recepción)",
        physicalNotes: "Observaciones de Campo",
        physicalNotesPlaceholder: "Relate las condiciones de recepción del material en el lugar...",
        approveLoad: "Aprobar Carga",
        rejectLoad: "Rechazar Carga",
        fullCompliance: "Conformidad Plena Detectada",
        noDivergence: "Sin discrepancias impeditivas. Arbitraje finalizado automáticamente.",
        arbitrationPlaceholder: "Describa la mediación técnica final para este lote...",
        signArbitration: "Firmar Arbitraje Técnico",
        vitalMediationNote: "Nota de Mediación Vital",
        acceptBatch: "Aceptar Lote",
        rejectBatch: "Rechazar Lote",
        clientAcceptance: "Estado de Aceptación del Cliente",
        homologated: "Lote Homologado",
        refused: "Lote Rechazado",
        repPartner: "Representante Socio",
        repQuality: "Analista de Calidad",
        signDigitalSealClient: "Firmar Sello Digital (Cliente)",
        signDigitalSealAnalyst: "Firmar Sello Digital (Analista)",
        vitalCertification: "Certificación Vital SGC",
        homologatedAsset: "Activo homologado para uso industrial seguro.",
        transmissionBlocked: "Transmisión Bloqueada",
        rejectedByPartner: "Lote rechazado por el socio. El workflow exige mediación técnica externa.",
        criticalDivergence: "Discrepancia técnica crítica detectada. Espere contacto de Calidad Aços Vital.",
        partnerContact: "Contacto del Socio (Representante)",
        digitalSignature: "Firma Digital Auditada",
        signed: "Firmado",
        waiting: "Esperando...",
        completion: "Conclusión de las 7 Etapas",
        protocolValidated: "Protocolo Validado",
        phaseAnalysis: "Fase en Análisis",
        awaitingRelease: "Esperando Liberación"
      },
      messages: {
        signSuccess: "Protocolo firmado con éxito.",
        syncError: "Error en la sincronización técnica.",
        evidenceSuccess: "Evidencia archivada con éxito.",
        noImages: "Sin Imágenes Adjuntas"
      }
    },
    metrics: {
      referenceId: "ID de Referencia",
      assetVersion: "Versión del Activo",
      partnerCompany: "Empresa Socia",
      vitalManager: "Responsable Vital",
      clientUser: "Usuario Cliente",
      auditWindow: "Ventana de Auditoría",
      cycleStart: "Inicio del Ciclo",
      techConclusion: "Conclusión Técnica"
    }
  },
  settings: {
    title: "Preferencias del Perfil",
    subtitle: "Gestione sus directrices de seguridad y protocolos de acceso.",
    securityCompliance: "Seguridad y Conformidad",
    techId: "ID TÉCNICO",
    changePassDesc: "Actualice su secreto de autenticación periódicamente para mantener la integridad de la cuenta.",
    privacyDesc: "Consulte cómo se procesan sus datos técnicos y registros de auditoría en el portal."
  },
  auth: {
    errors: {
      invalidCredentials: "Correo o contraseña inválidos.",
      samePassword: "La nueva contraseña debe ser diferente a la anterior.",
      weakPassword: "La contraseña proporcionada no cumple con los requisitos de complejidad.",
      tooManyRequests: "Demasiados intentos de acceso. Inténtelo de nuevo en unos momentos.",
      unexpected: "Ocurrió un error técnico inesperado.",
      sessionExpired: "Su sesión ha expirado. Por favor, identifíquese de nuevo."
    }
  },
  login: {
    title: "Portal de Calidad",
    subtitle: "SISTEMA DE GESTIÓN DE CALIDAD",
    corpEmail: "Correo Corporativo",
    accessPassword: "Contraseña de Acceso",
    forgotPassword: "¿Olvidó la contraseña?",
    authenticate: "Autenticación Segura",
    authenticateAccess: "Autenticación Segura",
    enterCredentials: "Use sus credenciales corporativas autorizadas por Aços Vital.",
    heroSubtitle: "Repositorio centralizado para documentación técnica y certificados de calidad. Precisión industrial en cada registro.",
    footerNote: "SISTEMAS MONITOREADOS • CUMPLIMIENTO DE PRIVACIDAD • © 2026 AÇOS VITAL",
    slogan: "Acero de confianza, calidad certificada",
    certification: "CALIDAD TÉCNICA CERTIFICADA",
    secureData: "ENLACE B2B ENCRIPTADO",
    monitoring: "MONITOREO DE SISTEMAS EN TIEMPO REAL",
    error: "Fallo en la autenticación del portal.",
    restrictedAccess: "Acceso Restringido",
    identifyToAccess: "Identifíquese para acceder al panel de certificados seguro.",
    accessManagedByVital: "Aços Vital gestiona su gobernanza de acceso internamente.",
    successTitle: "¡Acceso Concedido!",
    successSubtitle: "Redirigiendo al Gateway de Seguridad...",
    connectionError: "Fallo de conexión con el servidor de seguridad."
  },
  signup: {
    passwordPlaceholder: "Mín. 8 caracteres"
  },
  admin: {
    tabs: {
      overview: "Vista General",
      users: "Usuarios",
      logs: "Logs",
      settings: "Configuración"
    },
    stats: {
      totalUsers: "Registros de Identidad",
      organizations: "Socios Activos",
      activities: "Operaciones (24h)",
      activeClientsSummary: "{{count}} empresas en cartera",
      logsLast24hSummary: "{{count}} eventos registrados",
      headers: {
        timestamp: "Fecha/Hora",
        user: "Operador",
        action: "Operación",
        target: "Resumen",
        ip: "IP de Origen",
        severity: "Nivel"
      }
    },
    users: {
      identity: "Identidad",
      role: "Privilegios",
      roleLabel: "Nivel de Acceso",
      department: "Unidad",
      createTitle: "Nuevas Credenciales de Acceso",
      editTitle: "Modificar Perfil",
      name: "Nombre Completo Legal",
      email: "Identidad Corporativa",
      org: "Entidad Socia",
      filters: "Filtrar por"
    },
    clients: {
      createTitle: "Nueva Identidad de Socio",
      editTitle: "Modificar Socio"
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
    overview: "Insight Center",
    myAuditLog: "Forensic Audit Log",
    activePortfolio: "Cartera Activa",
    pendingDocs: "Urgencia Técnica",
    complianceISO: "Índice de Conformidad Vital",
    searchClient: "Buscar entidad por nombre o identificación fiscal...",
    newClientUser: "Nueva Identidad de Socio",
    newCompany: "Nueva Entidad Socia",
    allActivities: "Buscar logs por usuario, acción o IP...",
    errorLoadingClients: "Fallo al recuperar datos del portafolio.",
    errorLoadingQualityData: "Fallo en la sincronización de indicadores de calidad.",
    noQualityLogsFound: "No se detectaron logs de auditoría técnica.",
    invalidConfirmationCredentials: "Fallo en la autenticación para confirmación.",
    releaseTransmission: "Autorizar Transmisión",
    releaseTransmissionSuccess: "Protocolo Vital activado para el cliente.",
    contestVerdict: "Argumentación Técnica",
    contestVerdictSuccess: "Contestación enviada al cliente.",
    contestedBanner: "Veredicto en contestación. Contacte al analista vía correo.",
    releasedBy: "Liberado por",
    documentalCheck: "Check Documental",
    physicalCheck: "Check Físico",
    technicalObservations: "Observaciones Técnicas",
    flagsPlaceholder: "Añadir bandera...",
    approve: "Aprobar",
    reject: "Rechazar",
    uploadEvidence: "Cargar Evidencia",
    dragAndDrop: "Arrastre y suelte imágenes de evidencia aquí",
    inspectionLocked: "Fase bloqueada por dependencia de flujo"
  },
  roles: {
    ADMIN: "Administrador del Sistema",
    QUALITY: "Analista de Calidad Técnica",
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
      qualityAssured: "Gestión Vital"
    },
    exploreAll: "Expandir Cartera",
    fileStatusTimeline: "Ciclo de Vida de Conformidad del Activo",
    organization: "Entidad Corporativa",
    fiscalID: "Identificación Fiscal",
    contractDate: "Inicio del Ciclo de Vida",
    recentCertificates: "Certificados Recientes",
    complianceStatus: "Estado de Conformidad",
    certifiedOperation: "Operación Certificada",
    vitalStandard: "ESTÁNDAR AÇOS VITAL",
    traceability: "Trazabilidad",
    disclaimer: "Todos los certificados mostrados en este portal han sido validados por el laboratorio técnico de Aços Vital.",
    available: "Disponible",
    noRecentFiles: "No se encontraron archivos recientes.",
    criticalPendencies: "Pendientes Críticos",
    lastAnalysis: "Última Análisis",
    allClients: "Todos los Clientes",
    activeClients: "Clientes Activos"
  },
  client: {
    home: "Inicio",
    flux: "Flujo",
    portal: {
      title: "Terminal del Socio",
      libraryTitle: "Repositorio de Activos",
      auditTitle: "Gestión de Conformidad",
      gatewayActive: "Gateway B2B Activo",
      exclusiveTerminal: "Su terminal exclusivo de certificación industrial.",
      flowTitle: "Monitoreo de Flujo",
      flowSubtitle: "Estado de verificación física y documental en tiempo real"
    },
    dashboard: {
      loading: "Sincronizando Datos B2B...",
      pendingActions: "Acciones Pendientes",
      requireReview: "Requiere Verificación",
      validatedAssets: "Activos Validados",
      complianceSubtitle: "Protocolos en Conformidad",
      lastAudit: "Última Auditoría",
      protocolLabel: "Protocolo Vital SGC",
      recentHistory: "Historial de Activos Recibidos",
      accessLibrary: "Acceder a la Biblioteca",
      noRecent: "Sin movimientos recientes en el Vault.",
      auditAsset: "Auditar Activo"
    },
    library: {
      title: "Biblioteca de Activos",
      subtitle: "Archivos técnicos y certificados industriales",
      totalAssets: "Recursos: {{count}}",
      vaultLabel: "Vault Vital"
    }
  },
  cookie: {
    title: "Privacidad y Protección de Datos",
    text: "Utilizamos cookies esenciales para garantizar la seguridad de la sesión y la integridad de los certificados técnicos. Al continuar navegando en el portal Aços Vital, usted reconoce nuestra política de gobernanza de datos.",
    accept: "Reconocer y Continuar"
  },
  menu: {
    dashboard: "Inicio",
    library: "Biblioteca de archivos",
    certificates: "Certificados",
    management: "Gobernanza de Acceso",
    qualityManagement: "Conformidad de Calidad",
    portalName: "Portal de Calidad",
    brand: "Aços Vital",
    systemMonitoring: "MONITOREO DE SISTEMAS EN TIEMPO REAL",
    settings: "Preferencias del Perfil",
    sections: {
      main: "Navegación Principal",
      documents: "Gestión de Documentos",
      operational: "Módulos Operativos",
      governance: "Seguridad y Gobernanza"
    }
  },
  files: {
    authenticatingAccess: "Autorizando Solicitud...",
    authenticatingLayers: "Validando Capas de Seguridad...",
    authenticatedView: "Viewport Verificado",
    errorLoadingDocument: "Fallo al renderizar recurso técnico.",
    errorLoadingFiles: "Error de sincronización de recursos.",
    openInNewTab: "Ver Recurso Completo",
    pending: "Esperando Auditoría Técnica",
    groups: {
      approved: "Conforme / Aprobado",
      rejected: "No Conforme / Rechazado"
    },
    sort: {
      nameAsc: "Lexicográfico (A-Z)"
    },
    searchPlaceholder: "Buscar certificados, lotes o carpetas...",
    listView: "Lista Detallada",
    gridView: "Cuadrícula de Iconos",
    itemSelected: "recurso identificado",
    itemsSelected: "recursos identificados",
    processingFiles: "Ejecutando análisis de recursos...",
    upload: {
      title: "Carga Segura",
      button: "Importar",
      selectFile: "Seleccione el recurso técnico",
      chooseFile: "Buscar archivos",
      fileName: "Descriptor del recurso",
      fileNamePlaceholder: "Ej: Material_Spec_Batch123.pdf",
      uploadButton: "Iniciar Carga",
      noFileSelected: "Ningún recurso identificado.",
      fileNameRequired: "El descriptor es obligatorio para la trazabilidad.",
      success: "¡Recurso sincronizado con éxito!",
      noOrgLinked: "Usuario huérfano. Importación de recursos desactivada."
    },
    createFolder: {
      title: "Nuevo Directorio Estructural",
      button: "Nuevo Directorio",
      folderName: "Descriptor del directorio",
      folderNamePlaceholder: "Ej: Registros_Lote_2024",
      createButton: "Iniciar Directorio",
      nameRequired: "El descriptor de directorio es obligatorio.",
      success: "¡Directorio iniciado con éxito!",
      noOrgLinked: "Usuario huérfano. Creación de directorio desactivada."
    },
    rename: {
      title: "Modificar Descriptor",
      newName: "Nuevo descriptor",
      newNamePlaceholder: "Ingrese el nuevo valor",
      renameButton: "Aplicar Cambios",
      nameRequired: "El valor del descriptor es obligatorio.",
      success: "¡Recurso actualizado con éxito!"
    },
    delete: {
      confirmTitle: "Eliminación de Recurso",
      confirmMessage: "¿Ejecutar eliminación permanente de {{count}} elemento(s) seleccionado(s)? Esta operación es inmutable y auditada.",
      button: "Ejecutar Eliminación",
      success: "Elementos eliminados permanentemente del clúster."
    },
    downloadButton: "Exportar PDF",
    selectItem: "Objetivo {{name}}",
    noResultsFound: "Ningún activo coincide con la consulta.",
    typeToSearch: "Comience a escribir para filtrar recursos...",
    traceability: "Trazabilidad por Lote o Descriptor..."
  },
  changePassword: {
    title: "Seguridad de Acceso",
    current: "Credencial Existente",
    currentError: "La contraseña actual proporcionada es incorrecta.",
    new: "Nuevo Secreto Técnico",
    confirm: "Validar Nuevo Secreto",
    matchError: "Las credenciales no coinciden.",
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
    subtitle: "Cumplimiento Regulatorio y Estructura de Seguridad",
    close: "Entendido",
    viewPolicy: "Ver Política",
    section1: "Alcance de la Plataforma",
    section1_content: "El Portal de Calidad Aços Vital es una plataforma B2B para la gestión de documentos técnicos y certificados de calidad. Esta política aclara el cumplimiento con las Normas Técnicas y las leyes de protección de datos actuales (LGPD/GDPR).",
    section2: "Datos Recopilados",
    section2_item1: "Identificación: Nombre y correo corporativo.",
    section2_item2: "Corporativo: Identificación Fiscal e historial de contrato.",
    section2_item3: "Auditoría: Logs de IP y acciones del usuario (visualización/descarga).",
    section3: "Encriptación y Almacenamiento",
    section3_content: "Utilizamos encriptación TLS 1.2+ y segregación estricta por organización (Multi-tenant). Sus documentos nunca son accesibles por otras empresas de la cartera."
  },
  notifications: {
    title: "Alertas Operativas",
    markAllAsRead: "Limpiar todas las alertas",
    markedAsRead: "Alerta archivada.",
    markedAllAsRead: "Cola de alertas limpia.",
    emptyState: "Estado del sistema: Nominal. Sin alertas.",
    loading: "Sincronizando alertas...",
    errorLoading: "Fallo en la sincronización de alertas: {{message}}",
    errorMarkingAsRead: "Fallo al archivar alerta: {{message}}",
    errorMarkingAllAsRead: "Fallo al limpiar alertas: {{message}}",
  },
  maintenance: {
    title: "Mantenimiento del Sistema",
    message: "El gateway de seguridad está pasando por actualizaciones técnicas planeadas para mejorar el rendimiento de la visualización de certificados.",
    returnEstimate: "Regreso Estimado",
    todayAt: "Hoy a las {{time}}",
    soon: "Próximamente",
    retry: "Reintentar Conexión",
    contact: "Contactar Soporte",
    systemId: "Vital Cloud Engine v2.4.0"
  },
  maintenanceSchedule: {
    title: "Programar Mantenimiento",
    eventTitle: "Descripción del Evento",
    eventTitlePlaceholder: "Ej: Actualización del Clúster de Archivos",
    date: "Fecha Prevista",
    time: "Hora de Inicio",
    duration: "Downtime Estimado (min)",
    customMessage: "Comunicado a los Usuarios",
    scheduleButton: "Confirmar Ventana",
    scheduledSuccess: "Mantenimiento '{{title}}' programado con éxito.",
    scheduledError: "Fallo en la programación: {{message}}"
  }
};
