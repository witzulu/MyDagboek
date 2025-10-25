import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ProjectContext = createContext();

export const useProjects = () => {
  return useContext(ProjectContext);
};

export const ProjectProvider = ({ children }) => {
  const [projects] = useState([
    { id: '1', name: 'Dagboek Development' },
    { id: '2', name: 'Personal Website' },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Placeholder data for boards and notes,scoped to a project
  const [boards, setBoards] = useState([]);
  const [notes, setNotes] = useState('');

  const value = {
    projects,
    selectedProject,
    setSelectedProject,
    boards,
    setBoards,
    notes,
    setNotes,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

ProjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
