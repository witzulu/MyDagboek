import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const ProjectContext = createContext();

export default function ProjectProvider({ children }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const value = {
    selectedProject,
    setSelectedProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

ProjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
