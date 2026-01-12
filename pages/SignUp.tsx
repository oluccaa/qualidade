
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  Loader2, 
  Mail, 
  Lock, 
  User as UserIcon,
  ArrowRight, 
  CheckCircle2, 
  Globe,
  Building2,
  AlertOctagon,
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { userService, adminService } from '../services/index.ts';
import { ClientOrganization } from '../types.ts';
import { CookieBanner } from '../components/CookieBanner.tsx';
import { PrivacyModal } from '../components/PrivacyModal.tsx';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    department: ''
  });

  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClients, setIsFetchingClients] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      setIsFetchingClients(true);
      try {
        const data = await adminService.getClients();
        // A filtragem já deve vir do banco, mas mantemos por segurança
        setClients(data.filter(c => c.status === 'ACTIVE'));
      } catch (err) {
        console.error("Erro ao carregar empresas no SignUp:", err);
      } finally {
        setIsFetchingClients(false);
      }
    };
    loadClients();
  }, []);

  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
        setError('Por favor, informe seu nome completo.');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      // organizationId será nulo se for 'NEW' ou vazio
      const orgIdToSubmit = (formData.organizationId === 'NEW' || !formData.organizationId) 
        ? undefined 
        : formData.organizationId;

      await userService.signUp(
        formData.email.trim(), 
        formData.password, 
        formData.fullName.trim(), 
        orgIdToSubmit, 
        formData.department.trim()
      );
      
      setSuccess(true);
      // Redireciona após 3 segundos para dar tempo de ler o sucesso
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      console.error("SignUp Page Error:", err);
      
      if (err.message.includes('Database error') || err.message.includes('integridade')) {
         setError('Erro crítico de banco de dados. O administrador deve verificar o Trigger de criação de usuários no Supabase.');
      } else if (err.message.includes('already registered')) {
         setError('Este e-mail já está em uso.');
      } else {
         setError(err.message || 'Erro inesperado ao realizar cadastro.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 p-1 rounded-full shadow-lg flex items-center gap-1">
              <div className="pl-2 pr-1 text-slate-400">
                  <Globe size={14} />
              </div>
              {['pt', 'en', 'es'].map((lang) => (
                  <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`
                          px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all
                          ${i18n.language === lang 
                              ? 'bg-slate-900 text-white shadow-md' 
                              : 'text-slate-500 hover:bg-slate-100'}
                      `}
                  >
                      {lang}
                  </button>
              ))}
          </div>
      </div>

      <div className="hidden lg:flex lg:w-1/3 relative bg-slate-900 overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1920")' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950/90 to-blue-900/40" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white h-full">
            <div>
                <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">{t('common.back')}</span>
                </Link>
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/30">
                        <ShieldCheck size={32} className="text-blue-400" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Vital Link</span>
                </div>
                <h1 className="text-4xl font-bold leading-tight mb-4">Sua porta de entrada para a Qualidade.</h1>
                <p className="text-slate-400 leading-relaxed font-light">
                    Junte-se a centenas de empresas que utilizam a Aços Vital para garantir a rastreabilidade e conformidade de seus materiais.
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <CheckCircle2 size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Certificados em Tempo Real</p>
                        <p className="text-xs text-slate-500">Acesso instantâneo aos laudos técnicos.</p>
                    </div>
                </div>
                <div className="text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} Aços Vital S.A.
                </div>
            </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex items-center justify-center p-6 md:p-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-[550px] space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            
            {success ? (
                <div className="p-12 bg-white rounded-3xl shadow-xl border border-emerald-100 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Solicitação Enviada!</h2>
                        <p className="text-slate-500">Sua conta foi criada. Você será redirecionado para o login em instantes.</p>
                    </div>
                    <div className="flex justify-center">
                        <Loader2 size={24} className="animate-spin text-emerald-600" />
                    </div>
                </div>
            ) : (
                <div className="bg-white md:bg-transparent p-8 md:p-0 rounded-3xl shadow-xl md:shadow-none">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Criar Nova Conta</h2>
                        <p className="mt-2 text-sm text-slate-500">Preencha os dados abaixo para solicitar seu acesso ao portal.</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Nome Completo</label>
                                <div className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50 ${focusedInput === 'name' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
                                    <div className="pl-4 text-slate-400"><UserIcon size={18} /></div>
                                    <input 
                                        required
                                        className="w-full px-4 py-3 bg-transparent outline-none text-sm"
                                        placeholder="Ex: João Silva"
                                        value={formData.fullName}
                                        onFocus={() => setFocusedInput('name')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">E-mail Profissional</label>
                                <div className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50 ${focusedInput === 'email' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
                                    <div className="pl-4 text-slate-400"><Mail size={18} /></div>
                                    <input 
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 bg-transparent outline-none text-sm"
                                        placeholder="usuario@empresa.com"
                                        value={formData.email}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Sua Empresa</label>
                                <div className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50 ${focusedInput === 'org' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
                                    <div className="pl-4 text-slate-400"><Building2 size={18} /></div>
                                    <select 
                                        required
                                        disabled={isFetchingClients}
                                        className="w-full px-4 py-3 bg-transparent outline-none text-sm appearance-none cursor-pointer disabled:opacity-50"
                                        value={formData.organizationId}
                                        onFocus={() => setFocusedInput('org')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, organizationId: e.target.value})}
                                    >
                                        <option value="">{isFetchingClients ? 'Carregando empresas...' : 'Selecione...'}</option>
                                        {!isFetchingClients && clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                        {!isFetchingClients && <option value="NEW">Minha empresa não está na lista</option>}
                                    </select>
                                    {isFetchingClients && <div className="absolute right-4"><Loader2 size={16} className="animate-spin text-blue-500" /></div>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Departamento</label>
                                <div className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50 ${focusedInput === 'dep' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
                                    <input 
                                        className="w-full px-5 py-3 bg-transparent outline-none text-sm"
                                        placeholder="Ex: Qualidade, TI..."
                                        value={formData.department}
                                        onFocus={() => setFocusedInput('dep')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, department: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Senha</label>
                                <div className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50 ${focusedInput === 'pass' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
                                    <div className="pl-4 text-slate-400"><Lock size={18} /></div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3 bg-transparent outline-none text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onFocus={() => setFocusedInput('pass')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Confirmar Senha</label>
                                <div className={`relative flex items-center border rounded-xl transition-all duration-200 bg-slate-50/50 ${focusedInput === 'confirm' ? 'border-blue-500 bg-white ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
                                    <div className="pl-4 text-slate-400"><Lock size={18} /></div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3 bg-transparent outline-none text-sm"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onFocus={() => setFocusedInput('confirm')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-[11px] font-semibold rounded-xl border border-red-100 flex items-start gap-3 animate-shake">
                                <AlertOctagon size={16} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">Falha no registro</p>
                                    <p className="mt-1 font-normal opacity-90">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex flex-col gap-4">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 group"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Solicitar Acesso <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                            <p className="text-center text-sm text-slate-500">
                                Já possui uma conta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Fazer Login</Link>
                            </p>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
