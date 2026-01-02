import React from 'react';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer } from '../components/FileExplorer.tsx';
import { useAuth } from '../services/authContext.tsx';
import { 
    FileText, 
    Download, 
    CheckCircle2, 
    HelpCircle, 
    Clock, 
    TrendingUp,
    Shield
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock Stats for the client view
  const stats = [
    { label: 'Documentos Disponíveis', value: '142', icon: FileText, color: 'blue', sub: 'Total no acervo' },
    { label: 'Downloads este mês', value: '24', icon: Download, color: 'indigo', sub: 'Último há 2 dias' },
    { label: 'Status da Conta', value: 'Regular', icon: CheckCircle2, color: 'emerald', sub: 'Sem pendências' },
  ];

  return (
    <Layout title="Portal do Cliente">
      
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl shadow-blue-900/10 mb-8">
         {/* Abstract Decorative Shapes */}
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
         <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl mix-blend-overlay"></div>
         
         <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
               <div className="flex items-center gap-2 text-blue-200 text-sm font-medium uppercase tracking-wider">
                  <Shield size={16} /> Área Segura
               </div>
               <h1 className="text-4xl font-bold leading-tight">
                  Olá, {user?.name}
               </h1>
               <p className="text-blue-100 text-lg leading-relaxed">
                  Bem-vindo ao seu ambiente exclusivo. Aqui você acessa, visualiza e baixa todos os certificados de qualidade com total rastreabilidade.
               </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button className="bg-white text-blue-800 hover:bg-blue-50 px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-black/5 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                   <HelpCircle size={20} /> Central de Ajuda
                </button>
            </div>
         </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {stats.map((stat, idx) => (
             <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex items-start gap-5">
                 <div className={`p-4 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                     <stat.icon size={28} />
                 </div>
                 <div>
                     <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                     <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                     <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                        {idx === 0 && <TrendingUp size={12} className="text-green-500" />}
                        {stat.sub}
                     </p>
                 </div>
             </div>
         ))}
      </div>

      {/* Main Content: File Explorer */}
      <div className="flex flex-col gap-6">
         <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                    <Clock size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Seus Arquivos</h2>
                    <p className="text-xs text-slate-500">Navegue pelas pastas para encontrar seus documentos</p>
                </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sistema Online
            </span>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-100">
             <FileExplorer allowUpload={false} />
         </div>
      </div>
    </Layout>
  );
};

export default Dashboard;