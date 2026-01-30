
import React from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { FileExplorerView } from '../../quality/views/FileExplorerView.tsx';

export const ClientLibraryView: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <FileExplorerView 
      orgId={user?.organizationId || ''} 
    />
  );
};
