import React, { useState, memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Key, FileText, ShieldCheck, 
  Truck, Gavel, UserCheck, Lock, Award, Eye,
  Loader2, ChevronRight, XCircle, Database
} from 'lucide-react';
import { SteelBatchMetadata, QualityStatus, UserRole, AuditSignature } from '../../../../types/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';

interface AuditWorkflowProps {
  metadata: SteelBatchMetadata | undefined;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  fileId: string;
  onUpdate: (updatedMetadata: Partial<SteelBatchMetadata>) => Promise<void>;
  onUploadStepEvidence?: (file: File, step: 'documental' | 'physical') => Promise<void>;
}

/**
 * AuditWorkflow - Mobile-First Edition
 */
export const AuditWorkflow: React.FC<AuditWorkflowProps> = ({ 
    metadata, userRole, userName, userEmail, fileId, onUpdate
}) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [arbitrationText, setArbitrationText] = useState('');
  
  const isQuality = userRole === UserRole.QUALITY || userRole === UserRole.ADMIN;
  const isClient = userRole === UserRole.CLIENT;

  const stepsState = useMemo(() => {
    const sigs = metadata?.signatures || {};
    const s1 = !!sigs.step1_release;
    const s2 = !!sigs.step2_documental;
    const s3 = !!sigs.step3_physical;
    const s4 = !!sigs.step4_arbitrage;
    const s5 = !!sigs.step5_partner_verdict;
    const s6 = !!sigs.step6_consolidation_client && !!sigs.step6_consolidation_quality;
    
    const isArbitrationNeeded = metadata?.documentalStatus === 'REJECTED' || metadata?.physicalStatus === 'REJECTED';
    const isStep4AutoCompleted = s2 && s3 && !isArbitrationNeeded;
    const isStep4Done = s4 || isStep4AutoCompleted;

    return { s1, s2, s3, s4: isStep4Done, s5, s6, isArbitrationNeeded };
  }, [metadata?.signatures, metadata?.documentalStatus, metadata?.physicalStatus]);

  const handleAction = useCallback(async (stepKey: keyof SteelBatchMetadata['signatures'], updates: any) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const signature: AuditSignature = {
        userId: userName.replace(/\s+/g, '_').toLowerCase(),
        userName: userName,
        userEmail: userEmail,
        userRole: userRole,
        timestamp: new Date().toISOString(),
        action: `SIGN_${stepKey.toUpperCase()}`
      };
      
      const newSigs = { ...(metadata?.signatures || {}), [stepKey]: signature };
      await onUpdate({ ...updates, signatures: newSigs as any });
      showToast(`Protocolo Vital: Evento gravado no Ledger.`, "success");
    } catch (e) { 
      showToast("Erro na sincronia industrial.", "error"); 
    } finally { 
      setIsSyncing(false); 
    }
  }, [isSyncing, metadata?.signatures, onUpdate, userEmail, userName, userRole, showToast]);

  const handleNavigateToPreview = useCallback(() => {
      const mode = (!stepsState.s2 && isClient) ? '?mode=audit' : '?notes=true';
      navigate(`/preview/${fileId}${mode}`);
  }, [stepsState.s2, isClient, navigate, fileId]);

  return (
    <div className="relative space-y-4 md:space-y-6 pb-20" role="list">
        {/* Linha de Conexão: Dinâmica para Mobile */}
        <div className="absolute left-[27px] md:left-[39px] top-10 bottom-10 w-0.5 md:w-1 bg-slate-100 -z-10" />

        <MemoizedStepRow 
          step={1} title="Autorização (Vital)" 
          completed={stepsState.s1} active={!stepsState.s1} 
          signature={metadata?.signatures?.step1_release} icon={Key}
        >
          {isQuality && !stepsState.s1 && (
            <button 
                onClick={() => handleAction('step1_release', { status: QualityStatus.SENT })} 
                disabled={isSyncing}
                className="mt-4 w-full md:w-auto px-8 py-4 bg-[#132659] text-white rounded-2xl font-black text-[10px] uppercase tracking-[2px] shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={18}/> : <><Key size={18} /> Iniciar Protocolo</>}
            </button>
          )}
        </MemoizedStepRow>

        <MemoizedStepRow 
          step={2} title="Metadados Técnicos" 
          completed={stepsState.s2} active={stepsState.s1 && !stepsState.s2} 
          signature={metadata?.signatures?.step2_documental} icon={FileText}
        >
            <div className="flex flex-col gap-3 mt-4">
                <button 
                    disabled={!stepsState.s1 || isSyncing}
                    onClick={handleNavigateToPreview} 
                    className={`w-full py-4 md:py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                        stepsState.s1 ? 'bg-blue-50 text-blue-700 border-2 border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}
                >
                    {stepsState.s2 ? <><Eye size={18} /> Ver Notas</> : <><FileText size={18} /> Abrir Estação</>}
                </button>

                {isClient && stepsState.s1 && !stepsState.s2 && (
                    <button 
                        onClick={() => handleAction('step2_documental', { documentalStatus: 'APPROVED' })}
                        disabled={isSyncing}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3"
                    >
                        {isSyncing ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18} strokeWidth={4} /> Validar Dados</>}
                    </button>
                )}
            </div>
        </MemoizedStepRow>

        <MemoizedStepRow 
          step={3} title="Vistoria Física" 
          completed={stepsState.s3} active={stepsState.s1 && !stepsState.s3} 
          signature={metadata?.signatures?.step3_physical} icon={Truck}
        >
            {isClient && stepsState.s1 && !stepsState.s3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <button 
                        disabled={isSyncing}
                        onClick={() => handleAction('step3_physical', { physicalStatus: 'APPROVED' })}
                        className="h-14 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                    >
                        <Check size={18} strokeWidth={4} /> Conforme
                    </button>
                    <button 
                        disabled={isSyncing}
                        onClick={() => handleAction('step3_physical', { physicalStatus: 'REJECTED' })}
                        className="h-14 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                    >
                        <XCircle size={18} /> Divergente
                    </button>
                </div>
            )}
        </MemoizedStepRow>

        <MemoizedStepRow 
          step={4} title="Mediação / Arbitragem" 
          completed={stepsState.s4} active={stepsState.s2 && stepsState.s3 && stepsState.isArbitrationNeeded && !metadata?.signatures?.step4_arbitrage} 
          signature={metadata?.signatures?.step4_arbitrage} icon={Gavel}
        >
            {isQuality && stepsState.isArbitrationNeeded && !metadata?.signatures?.step4_arbitrage && (
                <div className="mt-4 space-y-3">
                    <textarea 
                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm min-h-[100px] outline-none focus:border-blue-500 font-medium"
                        placeholder="Parecer técnico..."
                        value={arbitrationText}
                        onChange={(e) => setArbitrationText(e.target.value)}
                    />
                    <button 
                        disabled={!arbitrationText.trim() || isSyncing}
                        onClick={() => handleAction('step4_arbitrage', { arbitrationNotes: arbitrationText })}
                        className="w-full h-14 bg-[#132659] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center"
                    >
                        {isSyncing ? <Loader2 className="animate-spin" size={18}/> : "Efetivar Arbitragem"}
                    </button>
                </div>
            )}
        </MemoizedStepRow>

        <StepRow step={5} title="Aceite do Parceiro" completed={stepsState.s5} active={stepsState.s4 && !stepsState.s5} icon={UserCheck} />
        <StepRow step={6} title="Assinatura Digital" completed={stepsState.s6} active={stepsState.s5 && !stepsState.s6} icon={Lock} />
        <StepRow step={7} title="Certificado Vital" completed={stepsState.s6} active={stepsState.s6} icon={Award} />
    </div>
  );
};

const StepRow = ({ title, active, completed, signature, children, icon: Icon, step }: any) => {
    return (
        <div className={`flex gap-4 md:gap-12 transition-all duration-500 ${completed ? 'opacity-60' : active ? 'opacity-100' : 'opacity-20'}`}>
            <div className="relative shrink-0 flex flex-col items-center">
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] border-2 md:border-4 flex items-center justify-center transition-all duration-500 shadow-lg
                    ${completed ? 'bg-emerald-600 border-white text-white' : 
                      active ? 'bg-[#132659] border-white text-white scale-105' : 
                      'bg-white border-slate-100 text-slate-300'}`}
                >
                    {completed ? <Check size={24} strokeWidth={4} /> : <Icon size={22} />}
                </div>
                <div className={`mt-2 text-[8px] font-black uppercase tracking-widest ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                    E{step}
                </div>
            </div>

            <div className="flex-1 pb-8 md:pb-16 min-w-0">
                <div className={`p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all ${
                    active ? 'bg-white border-blue-100 shadow-xl' : 
                    completed ? 'bg-slate-50 border-transparent' : 'bg-white border-slate-50'
                }`}>
                    <div className="flex items-center justify-between gap-3">
                        <h3 className={`text-sm md:text-xl font-black uppercase tracking-tighter truncate ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                            {title}
                        </h3>
                        {completed && <ShieldCheck size={20} className="text-emerald-500 shrink-0" />}
                    </div>

                    {children && <div className="mt-1">{children}</div>}

                    {signature && (
                        <div className="mt-6 p-3 bg-white/50 rounded-xl border border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {signature.userName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-800 uppercase truncate">{signature.userName}</p>
                                <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                                    {new Date(signature.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MemoizedStepRow = memo(StepRow);