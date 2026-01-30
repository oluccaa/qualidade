
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Key, Activity, FileText, ArrowRight, ShieldCheck, 
  Truck, Gavel, UserCheck, Lock, Award, Mail, AlertTriangle, XCircle,
  MessageSquare, Eye, User, Plus, X, Clock, Camera, Image as ImageIcon,
  Loader2, CheckCircle2, PenTool
} from 'lucide-react';
import { SteelBatchMetadata, QualityStatus, UserRole, AuditSignature } from '../../../../types/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useTranslation } from 'react-i18next';

interface AuditWorkflowProps {
  metadata: SteelBatchMetadata | undefined;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  fileId: string;
  onUpdate: (updatedMetadata: Partial<SteelBatchMetadata>) => Promise<void>;
  onUploadStepEvidence?: (file: File, step: 'documental' | 'physical') => Promise<void>;
  forceReadOnly?: boolean; // NOVA PROP PARA CONTROLE DE CONTEXTO
}

export const AuditWorkflow: React.FC<AuditWorkflowProps> = ({ 
    metadata, userRole, userName, userEmail, fileId, onUpdate, onUploadStepEvidence, forceReadOnly = false 
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [docNotes, setDocNotes] = useState(metadata?.documentalNotes || '');
  const [docFlags, setDocFlags] = useState<string[]>(metadata?.documentalFlags || []);
  const [newDocFlag, setNewDocFlag] = useState('');

  const [physNotes, setPhysNotes] = useState(metadata?.physicalNotes || '');
  const [physFlags, setPhysFlags] = useState<string[]>(metadata?.physicalFlags || []);

  const isQuality = userRole === UserRole.QUALITY || userRole === UserRole.ADMIN;
  const isClient = userRole === UserRole.CLIENT;

  // REGRAS DE BLOQUEIO DE INTERAÇÃO
  const isInteractionDisabled = forceReadOnly || isSyncing;

  const sigs = metadata?.signatures || {};
  const s1 = !!sigs.step1_release;
  const s2 = !!sigs.step2_documental;
  const s3 = !!sigs.step3_physical;
  const s4 = !!sigs.step4_arbitrage;
  const s5 = !!sigs.step5_partner_verdict;
  const s6_c = !!sigs.step6_consolidation_client;
  const s6_q = !!sigs.step6_consolidation_quality;
  const s6 = s6_c && s6_q; 

  const isArbitrationNeeded = metadata?.documentalStatus === 'REJECTED' || metadata?.physicalStatus === 'REJECTED';
  const isStep4AutoCompleted = s2 && s3 && !isArbitrationNeeded;
  const isStep4Done = s4 || isStep4AutoCompleted;

  const createSignature = (action: string): AuditSignature => ({
    userId: userEmail,
    userName: userName,
    userEmail: userEmail,
    userRole: userRole,
    timestamp: new Date().toISOString(),
    action: action
  });

  const handleAction = async (stepKey: keyof SteelBatchMetadata['signatures'], updates: any) => {
    if (isInteractionDisabled) return;
    setIsSyncing(true);
    try {
      const newSigs = { ...sigs, [stepKey]: createSignature(`SIGN_${stepKey.toUpperCase()}`) };
      await onUpdate({ ...updates, signatures: newSigs as any });
      showToast(t('audit.workflow.messages.signSuccess'), "success");
    } catch (e) { 
      showToast(t('audit.workflow.messages.syncError'), "error"); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const handleNavigateToPreview = () => {
      // Se já está forçado em ReadOnly, o preview continua em ReadOnly
      const mode = (forceReadOnly) ? '?notes=true' : (!s2 && isClient) ? '?mode=audit' : '?notes=true';
      navigate(`/preview/${fileId}${mode}`);
  };

  return (
    <div className="space-y-8" role="list" aria-label="Passos da Auditoria">
        
        <StepCard 
          step={1} title="Triagem Inicial do SGQ"
          completed={s1} active={!s1} 
          signature={sigs.step1_release} icon={Key}
        >
          {isQuality && !s1 && (
            <button 
                disabled={isInteractionDisabled}
                onClick={() => handleAction('step1_release', { status: QualityStatus.SENT })} 
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="animate-spin mx-auto" size={20}/> : "Liberar Fluxo Industrial"}
            </button>
          )}
        </StepCard>

        <StepCard 
          step={2} title="Conferência de Dados Técnicos" 
          completed={s2} active={s1 && !s2} 
          signature={sigs.step2_documental} icon={FileText}
        >
            <div className="space-y-4">
                <button 
                    disabled={!s1}
                    onClick={handleNavigateToPreview} 
                    className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        s1 ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-200 opacity-50'
                    }`}
                >
                    {s2 || forceReadOnly ? <><Eye size={16} /> Ver Notas de Auditoria</> : <><PenTool size={16} /> Estação de Anotação Técnica</>}
                </button>

                {((isClient && s1 && !s2) || (s2)) && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Relatório de Divergências</label>
                            <textarea 
                                readOnly={s2 || !isClient || forceReadOnly}
                                value={s2 ? (metadata?.documentalNotes || '') : docNotes}
                                onChange={e => setDocNotes(e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-70"
                                placeholder="Descreva observações técnicas..."
                            />
                        </div>
                        {isClient && s1 && !s2 && !forceReadOnly && (
                            <div className="flex gap-3">
                                <button disabled={isSyncing} onClick={() => handleAction('step2_documental', { documentalStatus: 'APPROVED', documentalNotes: docNotes, documentalFlags: docFlags })} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-700 shadow-lg disabled:opacity-50">Aprovar Dados</button>
                                <button disabled={isSyncing} onClick={() => handleAction('step2_documental', { documentalStatus: 'REJECTED', documentalNotes: docNotes, documentalFlags: docFlags })} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-700 shadow-lg disabled:opacity-50">Rejeitar Dados</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StepCard>

        <StepCard 
          step={3} title="Vistoria Física de Carga" 
          completed={s3} active={s2 && !s3} 
          signature={sigs.step3_physical} icon={Truck}
        >
            {isClient && s2 && !s3 && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <p className="text-xs text-slate-600 font-medium">A carga está em conformidade física com o pedido?</p>
                    {!forceReadOnly ? (
                        <div className="flex gap-3">
                            <button disabled={isSyncing} onClick={() => handleAction('step3_physical', { physicalStatus: 'APPROVED', physicalNotes: physNotes, physicalFlags: physFlags })} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg disabled:opacity-50">Carga Conforme</button>
                            <button disabled={isSyncing} onClick={() => handleAction('step3_physical', { physicalStatus: 'REJECTED', physicalNotes: physNotes, physicalFlags: physFlags })} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg disabled:opacity-50">Carga com Avaria</button>
                        </div>
                    ) : (
                        <span className="text-[10px] font-black text-slate-400 uppercase italic">Aguardando modo de auditoria</span>
                    )}
                </div>
            )}
        </StepCard>

        <StepCard step={4} title="Mediação e Arbitragem" completed={isStep4Done} active={s3 && isArbitrationNeeded && !s4} signature={sigs.step4_arbitrage} icon={Gavel}>
            {isStep4AutoCompleted && !s4 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Conformidade Plena: Sem divergências técnicas.</span>
                </div>
            )}
        </StepCard>

        <StepCard step={5} title="Aceite de Homologação" completed={s5} active={isStep4Done && !s5} signature={sigs.step5_partner_verdict} icon={UserCheck}>
            {isClient && isStep4Done && !s5 && !forceReadOnly && (
                <button onClick={() => handleAction('step5_partner_verdict', { status: QualityStatus.APPROVED })} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-700">Homologar Ativo</button>
            )}
        </StepCard>

        <StepCard step={6} title="Assinatura Digital Bilateral" completed={s6} active={s5 && !s6} icon={Lock}>
            <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border-2 text-center transition-all ${s6_c ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <p className="text-[9px] font-bold uppercase mb-1">Parceiro</p>
                    {s6_c ? <Check size={14} className="mx-auto" /> : <Clock size={14} className="mx-auto" />}
                </div>
                <div className={`p-3 rounded-xl border-2 text-center transition-all ${s6_q ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <p className="text-[9px] font-bold uppercase mb-1">Vital SGQ</p>
                    {s6_q ? <Check size={14} className="mx-auto" /> : <Clock size={14} className="mx-auto" />}
                </div>
            </div>
            {s5 && !s6 && !forceReadOnly && (
                <div className="mt-4">
                    {isClient && !s6_c && <button disabled={isSyncing} onClick={() => handleAction('step6_consolidation_client', {})} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg disabled:opacity-50">Assinar Selo Digital</button>}
                    {isQuality && !s6_q && <button disabled={isSyncing} onClick={() => handleAction('step6_consolidation_quality', {})} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg disabled:opacity-50">Assinar Selo Digital</button>}
                </div>
            )}
        </StepCard>

        <StepCard step={7} title="Certificação Vital" completed={s6} active={s6} icon={Award}>
            {s6 && (
                <div className="p-6 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-4 relative overflow-hidden">
                    <ShieldCheck size={32} className="relative z-10" />
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest">Ativo Homologado</p>
                        <p className="text-[10px] opacity-80 uppercase tracking-tighter">Certificado de Qualidade Vital v4.0</p>
                    </div>
                    <Award size={80} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
                </div>
            )}
        </StepCard>
    </div>
  );
};

const StepCard = ({ title, active, completed, signature, children, icon: Icon, step }: any) => {
    return (
        <div className={`p-6 rounded-3xl border-2 transition-all duration-300 relative ${
            active 
              ? 'bg-white shadow-xl border-blue-200 scale-[1.01]' 
              : completed ? 'bg-white border-slate-100 opacity-100' : 'bg-slate-50 border-transparent opacity-40 grayscale pointer-events-none'
        }`}>
            <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                    completed ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                    {completed ? <Check size={24} strokeWidth={3} /> : <Icon size={22} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className={`text-sm font-extrabold uppercase tracking-wide leading-none pt-1 ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step}. {title}
                        </h3>
                        {completed && <ShieldCheck size={18} className="text-emerald-500" />}
                    </div>
                    
                    {children && <div className="mt-4">{children}</div>}

                    {signature && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Assinado Digitalmente por:</p>
                                <p className="text-[10px] font-bold text-slate-700 uppercase truncate">{signature.userName}</p>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                {new Date(signature.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
