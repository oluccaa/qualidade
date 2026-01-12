
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
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

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

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
        setClients(data.filter(c => c.status === 'ACTIVE'));
      } catch (err) {
        console.error("Erro ao carregar empresas:", err);
      } finally {
        setIsFetchingClients(false);
      }
    };
    loadClients();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
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
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <div className="absolute top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-1 rounded-full shadow-xl flex items-center gap-1">
              <div className="pl-3 pr-1 text-slate-400">
                  <Globe size={14} />
              </div>
              {['pt', 'en', 'es'].map((lang) => (
                  <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`
                          px-3 py-1.5 text-[10px] font-bold uppercase rounded-full transition-all
                          ${i18n.language === lang ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}
                      `}
                  >
                      {lang}
                  </button>
              ))}
          </div>
      </div>

      <div className="hidden lg:flex lg:w-1/3 relative bg-slate-950 overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1920")' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900/40" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white h-full">
            <div className="space-y-12">
                <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[2px]">Voltar ao Login</span>
                </Link>
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    <img src={LOGO_URL} alt="Logo" className="h-16 object-contain drop-shadow-xl" />
                </div>
                <div className="space-y-6">
                    <h1 className="text-4xl font-black leading-tight tracking-tight">Sua porta de entrada para a Qualidade.</h1>
                    <p className="text-slate-400 leading-relaxed font-light text-lg">
                        Junte-se a rede de fornecedores e clientes da Aços Vital para garantir a rastreabilidade total de seus materiais.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <CheckCircle2 size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-wider">Acesso Imediato</p>
                        <p className="text-xs text-slate-400">Após aprovação interna do depto. de qualidade.</p>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Aços Vital S.A.
                </div>
            </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex items-center justify-center p-6 md:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-[600px] space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            
            {success ? (
                <div className="p-16 bg-white rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-emerald-100 text-center space-y-8">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={56} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Solicitação Enviada!</h2>
                        <p className="text-slate-500 font-medium">Sua conta foi criada. Você será redirecionado para o login em instantes.</p>
                    </div>
                    <div className="flex justify-center">
                        <Loader2 size={32} className="animate-spin text-emerald-600" />
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Criar Acesso</h2>
                        <p className="text-slate-500 font-medium">Preencha os dados abaixo para solicitar seu acesso ao portal.</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 ${focusedInput === 'name' ? 'border-slate-900 bg-white' : 'border-transparent'}`}>
                                    <div className="pl-4 text-slate-400"><UserIcon size={18} /></div>
                                    <input 
                                        required
                                        className="w-full px-4 py-4 bg-transparent outline-none text-sm font-bold"
                                        placeholder="João Silva"
                                        value={formData.fullName}
                                        onFocus={() => setFocusedInput('name')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
                                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 ${focusedInput === 'email' ? 'border-slate-900 bg-white' : 'border-transparent'}`}>
                                    <div className="pl-4 text-slate-400"><Mail size={18} /></div>
                                    <input 
                                        type="email"
                                        required
                                        className="w-full px-4 py-4 bg-transparent outline-none text-sm font-bold"
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
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa</label>
                                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 ${focusedInput === 'org' ? 'border-slate-900 bg-white' : 'border-transparent'}`}>
                                    <div className="pl-4 text-slate-400"><Building2 size={18} /></div>
                                    <select 
                                        required
                                        className="w-full px-4 py-4 bg-transparent outline-none text-sm appearance-none font-bold cursor-pointer"
                                        value={formData.organizationId}
                                        onFocus={() => setFocusedInput('org')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, organizationId: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        <option value="NEW">Minha empresa não está na lista</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 ${focusedInput === 'dep' ? 'border-slate-900 bg-white' : 'border-transparent'}`}>
                                    <input 
                                        className="w-full px-6 py-4 bg-transparent outline-none text-sm font-bold"
                                        placeholder="Qualidade, TI, Compras..."
                                        value={formData.department}
                                        onFocus={() => setFocusedInput('dep')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, department: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 ${focusedInput === 'pass' ? 'border-slate-900 bg-white' : 'border-transparent'}`}>
                                    <div className="pl-4 text-slate-400"><Lock size={18} /></div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-4 bg-transparent outline-none text-sm font-bold"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onFocus={() => setFocusedInput('pass')}
                                        onBlur={() => setFocusedInput(null)}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 text-slate-400 hover:text-slate-900">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 ${focusedInput === 'confirm' ? 'border-slate-900 bg-white' : 'border-transparent'}`}>
                                    <div className="pl-4 text-slate-400"><Lock size={18} /></div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-4 bg-transparent outline-none text-sm font-bold"
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
                            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                                <AlertOctagon size={18} />
                                {error}
                            </div>
                        )}

                        <div className="pt-6 flex flex-col gap-6">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="group relative w-full bg-slate-950 hover:bg-slate-800 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-slate-950/20 flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <><span className="uppercase tracking-widest">Solicitar Credenciais</span> <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>}
                            </button>
                            <p className="text-center text-sm text-slate-500 font-medium">
                                Já possui acesso? <Link to="/login" className="text-blue-600 font-black hover:underline underline-offset-4">Fazer Login</Link>
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
