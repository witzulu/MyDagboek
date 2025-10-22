import { useContext } from 'react';
import { ProjectContext } from '../components/ProjectContext';

export const useProject = () => {
  return useContext(ProjectContext);
};
