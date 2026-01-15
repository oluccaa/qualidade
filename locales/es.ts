
import { pt } from './pt.ts';

export const es: typeof pt = {
  common: {
    welcome: "Bienvenido",
    loading: "Cargando...",
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
    clear: "Limpiar"
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
    error: "Error de autenticación. Verifique sus credenciales.",
    restrictedAccess: "Acceso Restringido",
    identifyToAccess: "Identifíquese para acceder al panel de certificados seguro.",
    accessManagedByVital: "Aços Vital gestiona su gobernanza de acceso internamente.",
    successTitle: "¡Acceso Concedido!",
    successSubtitle: "Redireccionando al Gateway de Seguridad..."
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
      identity: "Identidad",
      role: "Privilegios",
      roleLabel: "Nivel de Acceso",
      department: "Unidad",
      createTitle: "Nueva Credencial de Acceso",
      editTitle: "Modificar Perfil",
      name: "Nombre Legal Completo",
      email: "Identidad Corporativa",
      org: "Entidad Asociada",
      filters: "Filtrar por"
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
    newCompany: "Nueva Entidad de Socio",
    allActivities: "Buscar registros por usuario, acción o IP...",
    errorLoadingClients: "Error al recuperar datos de la cartera.",
    errorLoadingQualityData: "Fallo en la sincronización de indicadores de calidad.",
    noQualityLogsFound: "No se detectaron registros de auditoría técnica.",
    invalidConfirmationCredentials: "Error en la autenticación de confirmación."
  },
  roles: {
    ADMIN: "Administrador del Sistema",
    QUALITY: "Analista de Calidad Técnica",
    CLIENT: "Socio Corporativo"
  },
  dashboard: {
    status: {
      monitoringActive: "SISTEMAS BAJO MONITOREO"
    },
    kpi: {
      libraryLabel: "Biblioteca de Activos",
      activeDocsSubtext: "Certificados Verificados"
    },
    exploreAll: "Expandir Cartera",
    fileStatusTimeline: "Ciclo de Vida del Cumplimiento",
    organization: "Razón Social",
    fiscalID: "ID Fiscal (CNPJ)",
    contractDate: "Inicio de Vigencia"
  },
  cookie: {
    title: "Privacidad y Protección de Datos",
    text: "Utilizamos cookies esenciales para garantizar la seguridad de la sesión y la integridad de los certificados técnicos. Al continuar navegando, acepta nuestra política de gobernanza de datos.",
    accept: "Aceptar y Continuar"
  },
  menu: {
    dashboard: "Centro de Mando",
    library: "Biblioteca de Activos",
    management: "Gobernanza",
    qualityManagement: "Cumplimiento de Calidad",
    portalName: "Portal de Calidad",
    brand: "Aços Vital",
    systemMonitoring: "MONITOREO DE INFRAESTRUCTURA",
    settings: "Preferencias", 
  },
  files: {
    authenticatingAccess: "Autorizando Solicitud...",
    authenticatedView: "Visor Verificado",
    errorLoadingDocument: "Error al renderizar el recurso técnico.",
    errorLoadingFiles: "Error de sincronización de recursos.",
    openInNewTab: "Ver Recurso Completo",
    pending: "Esperando Auditoría Técnica",
    groups: {
      approved: "Conforme",
      rejected: "No Conforme"
    },
    sort: {
      nameAsc: "Lexicográfico (A-Z)"
    },
    searchPlaceholder: "Buscar activos seguros...",
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
      fileNameRequired: "El descriptor es obligatorio.",
      success: "¡Recurso sincronizado con éxito!",
      noOrgLinked: "Usuario huérfano. Importación de recursos deshabilitada."
    },
    createFolder: {
      title: "Nuevo Directorio",
      button: "Nuevo Directorio",
      folderName: "Descriptor de directorio",
      folderNamePlaceholder: "Ej: Registros Lote 2024",
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
      confirmMessage: "¿Ejecutar eliminación permanente de {{count}} elemento(s)? Esta operación es inmutable.",
      button: "Ejecutar Eliminación"
    },
    downloadButton: "Exportar",
    selectItem: "Objetivo {{name}}",
    noResultsFound: "Ningún activo coincide con la consulta.",
    typeToSearch: "Escriba para filtrar recursos..."
  },
  changePassword: {
    title: "Restablecer Credenciales",
    current: "Credencial Existente",
    new: "Nueva Clave Secreta",
    confirm: "Validar Nueva Clave",
    minCharacters: "Entropía: Mín {{count}} caracteres",
    matchError: "Las credenciales no coinciden.",
    success: "¡Credenciales actualizadas con éxito!",
    errorUpdatingPassword: "Fallo en el servicio de actualización de credenciales.",
    submit: "Aplicar Política de Seguridad" 
  },
  privacy: {
    title: "Política de Gobernanza de Datos",
    subtitle: "Cumplimiento Regulatorio y Marco de Seguridad",
    close: "Entendido",
    section1: "Alcance de la Plataforma",
    section2: "Telemetría e Identidade",
    section3: "Infraestructura de Ciberseguridad"
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
  }
};
