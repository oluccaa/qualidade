import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { ChangePasswordModal } from '../../components/features/auth/ChangePasswordModal.tsx';
import { PrivacyModal } from '../../components/common/PrivacyModal.tsx';
import { Lock, ShieldCheck, Settings as SettingsIcon, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';
import { UserRole, normalizeRole } from '../../types/index.ts';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role);
  
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const languages = [
    { code: 'pt', label: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en', label: 'English (US)', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <Layout title={t('settings.title')}>
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

      {/* CONTAINER DE SCROLL DEDICADO */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-12 pb-32 pt-8 md:pt-12 px-6 md:px-10 animate-in fade-in duration-1000 max-w-5xl mx-auto font-sans">
          
          <header className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white text-blue-600 rounded-[2rem] flex items-center justify-center shadow-xl border border-slate-100 group">
                <SettingsIcon size={32} className="group-hover:rotate-90 transition-transform duration-700" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                  {t('settings.title')}
                </h1>
                <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-wider">
                  {t('settings.subtitle')}
                </p>
              </div>
            </div>
          </header>

          {/* Cartão de Identidade Premium */}
          <div className="bg-[#081437] text-white p-8 md:p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-blue-500/20" />
              
              <div className="flex items-center gap-8 relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-black shadow-2xl border-4 border-[#081437] shrink-0">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="space-y-2 min-w-0">
                     <h3 className="text-2xl font-black leading-none uppercase tracking-tight truncate">{user?.name}</h3>
                     <p className="text-sm font-bold text-slate-400 tracking-wider opacity-90 truncate">{user?.email}</p>
                     <div className="flex items-center gap-2 mt-2">
                         <span className="px-3 py-1 bg-white/10 text-white border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">{t(`roles.${userRole}`)}</span>
                     </div>
                  </div>
              </div>
              <div className="relative z-10 px-8 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300 shadow-inner">
                 {t('settings.techId')}: <span className="font-mono text-white ml-2">{user?.id?.split('-')[0].toUpperCase()}</span>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Coluna 1: Preferências Regionais */}
              <section className="space-y-6">
                  <div className="flex items-center gap-4 ml-2">
                      <div className="h-[2px] w-8 bg-blue-600 rounded-full" />
                      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Localização & Idioma</h2>
                  </div>
                  
                  <div className="bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      {languages.map((lang) => {
                          const isActive = i18n.language.startsWith(lang.code);
                          return (
                              <button
                                  key={lang.code}
                                  onClick={() => changeLanguage(lang.code)}
                                  className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all group ${
                                      isActive ? 'bg-slate-50 ring-2 ring-blue-500/10' : 'hover:bg-slate-50'
                                  }`}
                              >
                                  <div className="flex items-center gap-5">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all ${isActive ? 'bg-white shadow-md scale-110' : 'bg-slate-100 grayscale group-hover:grayscale-0'}`}>
                                          {lang.flag}
                                      </div>
                                      <span className={`text-sm font-bold uppercase tracking-wide ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                          {lang.label}
                                      </span>
                                  </div>
                                  {isActive && (
                                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                          <Check size={18} strokeWidth={4} />
                                      </div>
                                  )}
                              </button>
                          );
                      })}
                  </div>
              </section>

              {/* Coluna 2: Segurança */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 ml-2">
                  <div className="h-[2px] w-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">{t('settings.securityCompliance')}</h2>
                </div>
                
                <div className="space-y-4">
                  <SettingsCard 
                    icon={Lock}
                    title={t('changePassword.title')}
                    desc={t('settings.changePassDesc')}
                    actionLabel={t('changePassword.submit')}
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    color="text-blue-600"
                    bg="bg-blue-50"
                  />

                  <SettingsCard 
                    icon={ShieldCheck}
                    title={t('privacy.title')}
                    desc={t('settings.privacyDesc')}
                    actionLabel={t('privacy.viewPolicy')}
                    onClick={() => setIsPrivacyModalOpen(true)}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                  />
                </div>
              </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const SettingsCard = ({ icon: Icon, title, desc, actionLabel, onClick, color, bg }: any) => (
  <button 
    onClick={onClick}
    className="w-full group bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all text-left flex flex-col justify-between relative overflow-hidden"
  >
    <div className="space-y-5 relative z-10">
      <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon size={26} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">{title}</h3>
        <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">{desc}</p>
      </div>
    </div>
    
    <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[2px] text-slate-400 group-hover:text-slate-900 transition-colors pt-6 border-t border-slate-100 w-full">
      {actionLabel} <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform text-blue-500" />
    </div>
  </button>
);

export default SettingsPage;