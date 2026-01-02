import React from 'react';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer } from '../components/FileExplorer.tsx';
import { FileText, UploadCloud, Users, Zap } from 'lucide-react';

const Quality: React.FC = () => {
  const stats = [
      { label: 'Certificados Pendentes', value: '12', icon: FileText, color: 'orange' },
      { label: 'Uploads Realizados Hoje', value: '45', icon: UploadCloud, color: 'blue' },
      { label: 'Clientes Ativos', value: '28', icon: Users, color: 'emerald' },
  ];

  return (
    <Layout title="Gestão de Qualidade">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center justify-between group">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                    <div className={`p-4 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                        <stat.icon size={24} />
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-500" />
                    Área de Trabalho
                 </h3>
                 <span className="text-xs text-slate-400">Modo de Edição Habilitado</span>
            </div>
            <div className="flex-1">
                <FileExplorer allowUpload={true} />
            </div>
        </div>
    </Layout>
  );
};

export default Quality;