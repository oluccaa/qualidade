
export const en = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    syncing: "Syncing...",
    privacy: "Privacy",
    logout: "Logout",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    na: "N/A",
    status: "Status",
    statusActive: "Active",
    statusInactive: "Inactive",
    uploaded: "Upload Completed",
    updatingDatabase: "Updating database...",
    errorLoadingLogs: "Error loading logs: {{message}}",
    changePassword: "Change Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    close: "Close",
    delete: "Delete",
    language: {
      pt: "Portuguese",
      en: "English",
      es: "Spanish"
    },
    clear: "Clear",
    moreOptions: "More options",
    skipToContent: "Skip to content",
    retry: "Retry",
    success: "Success",
    error: "Error"
  },
  loaders: {
    preparingPortal: "Preparing Aços Vital Quality Portal",
    preparingInterface: "Preparing Vital Interface...",
    validatingProtocols: "Validating Security Protocols...",
    syncFailure: "Synchronization Failure",
    syncingModule: "Syncing Module...",
    scanningLedger: "Scanning Ledger...",
    syncingVault: "Syncing Vault...",
    syncingBacklog: "Syncing Technical Backlog..."
  },
  audit: {
    workflow: {
      title: "Industrial Audit Flow",
      partnerTitle: "Compliance and Technical Acceptance",
      subtitle: "Strict control of industrial verdicts.",
      partnerSubtitle: "Verification and signing of homologated certificates.",
      steps: {
        step1: "1. Initial Screening (QMS)",
        step2: "2. Data Verification",
        step3: "3. Cargo Inspection",
        step4: "4. Technical Arbitration",
        step5: "5. Partner Verdict",
        step6: "6. Digital Consolidation",
        step7: "7. Certified Vital Protocol"
      },
      labels: {
        authFlow: "Authorize Industrial Flow",
        stationAnnotation: "Technical Annotation Station",
        viewNotes: "View Notes (Read-only)",
        attachDocs: "Attach Scanned Documentation",
        attachDocsDesc: "Use this field if you printed the document to annotate by hand or if you have additional proof of discrepancy.",
        auditFlags: "Audit Flags",
        addFlag: "Add flag...",
        reportDivergence: "Discrepancy Report",
        reportDivergencePlaceholder: "Formally describe the technical observations regarding this document...",
        signValidation: "Sign Data Validation",
        galleryField: "Field Gallery (Photos/Documents)",
        galleryFieldDesc: "Attach photos of the received cargo, seals, or documents that accompanied the transport here.",
        physicalState: "Physical State (Receiving Flags)",
        physicalNotes: "Field Observations",
        physicalNotesPlaceholder: "Report the material reception conditions on site...",
        approveLoad: "Approve Cargo",
        rejectLoad: "Reject Cargo",
        fullCompliance: "Full Compliance Detected",
        noDivergence: "No impeding discrepancies. Arbitration completed automatically.",
        arbitrationPlaceholder: "Describe the final technical mediation for this batch...",
        signArbitration: "Sign Technical Arbitration",
        vitalMediationNote: "Vital Mediation Note",
        acceptBatch: "Accept Batch",
        rejectBatch: "Reject Batch",
        clientAcceptance: "Client Acceptance Status",
        homologated: "Homologated Batch",
        refused: "Refused Batch",
        repPartner: "Partner Representative",
        repQuality: "Quality Analyst",
        signDigitalSealClient: "Sign Digital Seal (Client)",
        signDigitalSealAnalyst: "Sign Digital Seal (Analyst)",
        vitalCertification: "Vital QMS Certification",
        homologatedAsset: "Asset homologated for safe industrial use.",
        transmissionBlocked: "Transmission Blocked",
        rejectedByPartner: "Batch rejected by partner. Workflow requires external technical mediation.",
        criticalDivergence: "Critical technical discrepancy detected. Await contact from Aços Vital Quality.",
        partnerContact: "Partner Contact (Representative)",
        digitalSignature: "Audited Digital Signature",
        signed: "Signed",
        waiting: "Waiting...",
        completion: "Completion of 7 Steps",
        protocolValidated: "Protocol Validated",
        phaseAnalysis: "Phase under Analysis",
        awaitingRelease: "Awaiting Release"
      },
      messages: {
        signSuccess: "Protocol signed successfully.",
        syncError: "Technical synchronization error.",
        evidenceSuccess: "Evidence archived successfully.",
        noImages: "No Images Attached"
      }
    },
    metrics: {
      referenceId: "Reference ID",
      assetVersion: "Asset Version",
      partnerCompany: "Partner Company",
      vitalManager: "Vital Supervisor",
      clientUser: "Client User",
      auditWindow: "Audit Window",
      cycleStart: "Cycle Start",
      techConclusion: "Technical Conclusion"
    }
  },
  settings: {
    title: "Profile Preferences",
    subtitle: "Manage your security guidelines and access protocols.",
    securityCompliance: "Security and Compliance",
    techId: "TECHNICAL ID",
    changePassDesc: "Update your authentication secret periodically to maintain account integrity.",
    privacyDesc: "Consult how your technical data and audit records are processed in the portal."
  },
  auth: {
    errors: {
      invalidCredentials: "Invalid email or password.",
      samePassword: "The new password must be different from the old password.",
      weakPassword: "The provided password does not meet complexity requirements.",
      tooManyRequests: "Too many login attempts. Please try again in a few moments.",
      unexpected: "An unexpected technical error occurred.",
      sessionExpired: "Your session has expired. Please log in again."
    }
  },
  login: {
    title: "Quality Portal",
    subtitle: "QUALITY MANAGEMENT SYSTEM",
    corpEmail: "Corporate Email",
    accessPassword: "Access Password",
    forgotPassword: "Forgot password?",
    authenticate: "Secure Authentication",
    authenticateAccess: "Secure Authentication",
    enterCredentials: "Use your authorized corporate credentials by Aços Vital.",
    heroSubtitle: "Centralized repository for technical documentation and quality certificates. Industrial precision in every record.",
    footerNote: "MONITORED SYSTEMS • PRIVACY COMPLIANCE • © 2026 AÇOS VITAL",
    slogan: "Steel you can trust, certified quality",
    certification: "CERTIFIED TECHNICAL QUALITY",
    secureData: "ENCRYPTED B2B LINK",
    monitoring: "REAL-TIME SYSTEM MONITORING",
    error: "Portal authentication failure.",
    restrictedAccess: "Restricted Access",
    identifyToAccess: "Identify yourself to access the secure certificate dashboard.",
    accessManagedByVital: "Aços Vital manages your access governance internally.",
    successTitle: "Access Granted!",
    successSubtitle: "Redirecting to the Security Gateway...",
    connectionError: "Connection failure with the security server."
  },
  signup: {
    passwordPlaceholder: "Min. 8 characters"
  },
  admin: {
    tabs: {
      overview: "Overview",
      users: "Users",
      logs: "Logs",
      settings: "Settings"
    },
    stats: {
      totalUsers: "Identity Records",
      organizations: "Active Partners",
      activities: "Operations (24h)",
      activeClientsSummary: "{{count}} companies in portfolio",
      logsLast24hSummary: "{{count}} events recorded",
      headers: {
        timestamp: "Date/Time",
        user: "Operator",
        action: "Operation",
        target: "Summary",
        ip: "Source IP",
        severity: "Level"
      }
    },
    users: {
      identity: "Identity",
      role: "Privileges",
      roleLabel: "Access Level",
      department: "Unit",
      createTitle: "New Access Credentials",
      editTitle: "Modify Profile",
      name: "Legal Full Name",
      email: "Corporate Identity",
      org: "Partner Entity",
      filters: "Filter by"
    },
    clients: {
      createTitle: "New Partner Identity",
      editTitle: "Modify Partner"
    },
    logs: {
      allSeverities: "All Severities",
      severity: {
        INFO: "Informational",
        WARNING: "Warning",
        ERROR: "Error",
        CRITICAL: "Critical"
      }
    }
  },
  quality: {
    overview: "Insight Center",
    myAuditLog: "Forensic Audit Log",
    activePortfolio: "Active Portfolio",
    pendingDocs: "Technical Urgency",
    complianceISO: "Vital Compliance Index",
    searchClient: "Search entity by name or Tax ID...",
    newClientUser: "New Partner Identity",
    newCompany: "New Partner Entity",
    allActivities: "Search logs by user, action, or IP...",
    errorLoadingClients: "Failed to retrieve portfolio data.",
    errorLoadingQualityData: "Quality indicator synchronization failed.",
    noQualityLogsFound: "No technical audit logs detected.",
    invalidConfirmationCredentials: "Authentication failed for confirmation.",
    releaseTransmission: "Authorize Transmission",
    releaseTransmissionSuccess: "Vital Protocol activated for the client.",
    contestVerdict: "Technical Argumentation",
    contestVerdictSuccess: "Contestation sent to client.",
    contestedBanner: "Verdict under contestation. Contact the analyst via email.",
    releasedBy: "Released by",
    documentalCheck: "Documental Check",
    physicalCheck: "Physical Check",
    technicalObservations: "Technical Observations",
    flagsPlaceholder: "Add flag...",
    approve: "Approve",
    reject: "Reject",
    uploadEvidence: "Upload Evidence",
    dragAndDrop: "Drag and drop evidence images here",
    inspectionLocked: "Phase blocked by flow dependency"
  },
  roles: {
    ADMIN: "System Administrator",
    QUALITY: "Technical Quality Analyst",
    CLIENT: "Partner"
  },
  dashboard: {
    status: {
      monitoringActive: "SYSTEMS UNDER MONITORING"
    },
    kpi: {
      libraryLabel: "Home",
      activeDocsSubtext: "Verified Certificates",
      recent: "Recent",
      viewedToday: "Viewed Today",
      compliance: "Compliance",
      assured: "VALIDATED",
      qualityAssured: "Vital Management"
    },
    exploreAll: "Expand Portfolio",
    fileStatusTimeline: "Asset Compliance Lifecycle",
    organization: "Corporate Entity",
    fiscalID: "Tax ID",
    contractDate: "Lifecycle Start",
    recentCertificates: "Recent Certificates",
    complianceStatus: "Compliance Status",
    certifiedOperation: "Certified Operation",
    vitalStandard: "AÇOS VITAL STANDARD",
    traceability: "Traceability",
    disclaimer: "All certificates displayed in this portal were validated by the Aços Vital technical laboratory.",
    available: "Available",
    noRecentFiles: "No recent files found.",
    criticalPendencies: "Critical Pendencies",
    lastAnalysis: "Last Analysis",
    allClients: "All Clients",
    activeClients: "Active Clients"
  },
  client: {
    home: "Home",
    flux: "Flow",
    portal: {
      title: "Partner Terminal",
      libraryTitle: "Asset Repository",
      auditTitle: "Compliance Management",
      gatewayActive: "B2B Gateway Active",
      exclusiveTerminal: "Your exclusive industrial certification terminal.",
      flowTitle: "Flow Monitoring",
      flowSubtitle: "Real-time physical and documental verification status"
    },
    dashboard: {
      loading: "Syncing B2B Data...",
      pendingActions: "Pending Actions",
      requireReview: "Requires Verification",
      validatedAssets: "Validated Assets",
      complianceSubtitle: "Compliant Protocols",
      lastAudit: "Last Audit",
      protocolLabel: "Vital QMS Protocol",
      recentHistory: "Received Assets History",
      accessLibrary: "Access Library",
      noRecent: "No recent movements in the Vault.",
      auditAsset: "Audit Asset"
    },
    library: {
      title: "Asset Library",
      subtitle: "Technical files and industrial certificates",
      totalAssets: "Resources: {{count}}",
      vaultLabel: "Vital Vault"
    }
  },
  cookie: {
    title: "Privacy and Data Protection",
    text: "We use essential cookies to ensure session security and the integrity of technical certificates. By continuing to browse the Aços Vital portal, you acknowledge our data governance policy.",
    accept: "Acknowledge and Continue"
  },
  menu: {
    dashboard: "Home",
    library: "File Library",
    certificates: "Certificates",
    management: "Access Governance",
    qualityManagement: "Quality Compliance",
    portalName: "Quality Portal",
    brand: "Aços Vital",
    systemMonitoring: "REAL-TIME SYSTEM MONITORING",
    settings: "Profile Preferences",
    sections: {
      main: "Main Navigation",
      documents: "Document Management",
      operational: "Operational Modules",
      governance: "Security and Governance"
    }
  },
  files: {
    authenticatingAccess: "Authorizing Request...",
    authenticatingLayers: "Validating Security Layers...",
    authenticatedView: "Verified Viewport",
    errorLoadingDocument: "Failed to render technical resource.",
    errorLoadingFiles: "Resource synchronization error.",
    openInNewTab: "View Full Resource",
    pending: "Awaiting Technical Audit",
    groups: {
      approved: "Compliant / Approved",
      rejected: "Non-Compliant / Rejected"
    },
    sort: {
      nameAsc: "Lexicographical (A-Z)"
    },
    searchPlaceholder: "Search certificates, batches, or folders...",
    listView: "Detailed List",
    gridView: "Icon Grid",
    itemSelected: "resource identified",
    itemsSelected: "resources identified",
    processingFiles: "Executing resource analysis...",
    upload: {
      title: "Secure Upload",
      button: "Import",
      selectFile: "Select the technical resource",
      chooseFile: "Browse files",
      fileName: "Resource descriptor",
      fileNamePlaceholder: "Ex: Material_Spec_Batch123.pdf",
      uploadButton: "Initialize Upload",
      noFileSelected: "No resource identified.",
      fileNameRequired: "Descriptor is mandatory for traceability.",
      success: "Resource synced successfully!",
      noOrgLinked: "Orphan user. Resource importation disabled."
    },
    createFolder: {
      title: "New Structural Directory",
      button: "New Directory",
      folderName: "Directory descriptor",
      folderNamePlaceholder: "Ex: Records_Batch_2024",
      createButton: "Initialize Directory",
      nameRequired: "Directory descriptor is required.",
      success: "Directory initialized successfully!",
      noOrgLinked: "Orphan user. Directory creation disabled."
    },
    rename: {
      title: "Modify Descriptor",
      newName: "New descriptor",
      newNamePlaceholder: "Enter the new value",
      renameButton: "Apply Changes",
      nameRequired: "Descriptor value is required.",
      success: "Resource updated successfully!"
    },
    delete: {
      confirmTitle: "Resource Removal",
      confirmMessage: "Execute permanent removal of {{count}} selected item(s)? This operation is immutable and audited.",
      button: "Execute Removal",
      success: "Items permanently deleted from cluster."
    },
    downloadButton: "Export PDF",
    selectItem: "Target {{name}}",
    noResultsFound: "No assets match the query.",
    typeToSearch: "Start typing to filter resources...",
    traceability: "Traceability by Batch or Descriptor..."
  },
  changePassword: {
    title: "Access Security",
    current: "Existing Credential",
    currentError: "The provided current password is incorrect.",
    new: "New Technical Secret",
    confirm: "Validate New Secret",
    matchError: "Credentials do not match.",
    success: "Password updated successfully!",
    errorUpdatingPassword: "Credential update service failure.",
    submit: "Apply Security Policy",
    requirements: {
      length: "At least 8 characters",
      upper: "One uppercase letter",
      number: "One number (0-9)",
      special: "One special character (@#$!*)"
    }
  },
  privacy: {
    title: "Data Governance and Privacy",
    subtitle: "Regulatory Compliance and Security Framework",
    close: "Acknowledged",
    viewPolicy: "View Policy",
    section1: "Platform Scope",
    section1_content: "The Aços Vital Quality Portal is a B2B platform for technical document management and quality certificates. This policy clarifies compliance with Technical Standards and current data protection laws (LGPD/GDPR).",
    section2: "Collected Data",
    section2_item1: "Identification: Name and corporate email.",
    section2_item2: "Corporate: Tax ID and contract history.",
    section2_item3: "Audit: IP logs and user actions (view/download).",
    section3: "Encryption and Storage",
    section3_content: "We use TLS 1.2+ encryption and strict organization segregation (Multi-tenant). Your documents are never accessible by other companies in the portfolio."
  },
  notifications: {
    title: "Operational Alerts",
    markAllAsRead: "Clear all alerts",
    markedAsRead: "Alert archived.",
    markedAllAsRead: "Alert queue cleared.",
    emptyState: "System status: Nominal. No alerts.",
    loading: "Syncing alerts...",
    errorLoading: "Alert synchronization failure: {{message}}",
    errorMarkingAsRead: "Failed to archive alert: {{message}}",
    errorMarkingAllAsRead: "Failed to clear alerts: {{message}}",
  },
  maintenance: {
    title: "System Maintenance",
    message: "The security gateway is undergoing planned technical updates to improve certificate viewing performance.",
    returnEstimate: "Estimated Return",
    todayAt: "Today at {{time}}",
    soon: "Coming soon",
    retry: "Retry Connection",
    contact: "Contact Support",
    systemId: "Vital Cloud Engine v2.4.0"
  },
  maintenanceSchedule: {
    title: "Schedule Maintenance",
    eventTitle: "Event Description",
    eventTitlePlaceholder: "Ex: File Cluster Upgrade",
    date: "Scheduled Date",
    time: "Start Time",
    duration: "Estimated Downtime (min)",
    customMessage: "Announcement to Users",
    scheduleButton: "Confirm Window",
    scheduledSuccess: "Maintenance '{{title}}' scheduled successfully.",
    scheduledError: "Scheduling failure: {{message}}"
  }
};
