
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Loader2, Filter, ShieldCheck, Mail, Building2 } from 'lucide-react';
import { UserList } from '../components/UserList.tsx';
import { UserModal } from '../modals/AdminModals.tsx';
import { useAdminUserManagement } from '../hooks/useAdminUserManagement.ts';
import { UserRole } from '../../../types/index';

interface AdminUsersProps {
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ setIsSaving }) => {
  const { t } = useTranslation();

  const {
    filteredUsers,
    isLoadingUsers,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    formData,
    setFormData,
    clientsList,
  } = useAdminUserManagement({ setIsSaving });

  return (
    <div className="space-y-6">
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        organizations={clientsList}
      />

      {/* Toolbar Superior */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou organização..."
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 custom-scrollbar">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            {(['ALL', UserRole.ADMIN, UserRole.QUALITY, UserRole.CLIENT] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  roleFilter === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {role === 'ALL' ? 'Todos' : t(`roles.${role}`)}
              </button>
            ))}
          </div>

          <button 
            onClick={() => openUserModal()}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all shrink-0"
          >
            <UserPlus size={16} /> Criar Acesso
          </button>
        </div>
      </div>

      {isLoadingUsers ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="font-bold text-xs uppercase tracking-widest">Sincronizando base de usuários...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
          <UserList users={filteredUsers} onEdit={openUserModal} />
        </div>
      )}
    </div>
  );
};
