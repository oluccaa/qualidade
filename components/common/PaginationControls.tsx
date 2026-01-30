
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading
}) => {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageSizes = [10, 20, 50, 100, 500];

  return (
    /* 
       RODAPÉ TÉCNICO FIXO:
       - h-16: Altura fixa padrão
       - bottom-0: Ancorado no chão
       - border-t: Divisão visual clara
       - bg-white: Fundo sólido industrial
       - z-40: Abaixo de modais de sistema (z-50+)
    */
    <footer className="w-full shrink-0 bg-white border-t border-slate-200 h-16 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="h-full px-8 flex items-center justify-between gap-4">
        
        {/* Esquerda: Status do Ledger */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] leading-none mb-1">Ledger Sync</p>
            <p className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
              Exibindo <span className="text-blue-600 font-black">{startItem}-{endItem}</span> de <span className="text-slate-900 font-black">{totalItems}</span>
            </p>
          </div>
        </div>

        {/* Centro: Navegação Digital */}
        <nav className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50" aria-label="Navegação">
          <NavPill 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1 || isLoading} 
            icon={ChevronsLeft} 
            ariaLabel="Primeira"
          />
          <NavPill 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1 || isLoading} 
            icon={ChevronLeft} 
            ariaLabel="Anterior"
          />
          
          <div className="flex items-center justify-center px-4 min-w-[70px]">
            <span className="text-[10px] font-black text-slate-900 font-mono">
              {currentPage} <span className="mx-1 text-slate-300">/</span> {totalPages}
            </span>
          </div>

          <NavPill 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || isLoading} 
            icon={ChevronRight} 
            ariaLabel="Próxima"
          />
          <NavPill 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages || isLoading} 
            icon={ChevronsRight} 
            ariaLabel="Última"
          />
        </nav>

        {/* Direita: Configuração de Densidade */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-[10px] font-black text-slate-700 pl-3 pr-8 py-1.5 outline-none cursor-pointer appearance-none transition-all shadow-sm"
              disabled={isLoading}
            >
              {pageSizes.map(size => (
                <option key={size} value={size}>{size} / pág</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ListFilter size={10} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const NavPill = ({ onClick, disabled, icon: Icon, ariaLabel }: { onClick: () => void, disabled?: boolean, icon: React.ElementType, ariaLabel: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm disabled:opacity-20 transition-all active:scale-90"
  >
    <Icon size={14} strokeWidth={3} />
  </button>
);
