
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Otimizações para produção
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Manual chunks ajudam a separar bibliotecas pesadas do código da aplicação
        // Isso permite que o navegador faça cache das libs (que mudam pouco) separadamente do seu código
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          icons: ['lucide-react'],
        },
      },
    },
    // Aviso de tamanho de chunk (opcional, ajustado para evitar warnings desnecessários em apps grandes)
    chunkSizeWarningLimit: 1000,
  },
});
