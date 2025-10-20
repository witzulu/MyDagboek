import { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';

export const useProject = () => {
  return useContext(ProjectContext);
};
