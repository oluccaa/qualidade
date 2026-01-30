import React, { useState } from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { AdminUsers } from '../../components/features/admin/views/AdminUsers.tsx';
import { UserCheck, Loader2, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

const QualityUserManagement: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Layout title="Gestão de Parceiros">
      <div className="flex flex-col flex-1 h-full overflow-hidden animate-in fade-in duration-700 px-6 md:px-10 pt-4 md:pt-8">
        {isSaving && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-[#081437] text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> Sincronizando...
          </div>
        )}

        {/* Header Padronizado (Estilo Overview) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-200">
                    <UserCheck size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Credenciais Técnicas</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-tight italic opacity-70">
                        Controle de identidades e acessos do ecossistema Vital.
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shadow-sm shrink-0">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Apenas Perfis Parceiros</span>
            </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
            <AdminUsers setIsSaving={setIsSaving} restrictedToRole={UserRole.CLIENT} />
        </div>
      </div>
    </Layout>
  );
};

export default QualityUserManagement;