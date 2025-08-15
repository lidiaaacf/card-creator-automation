import React from 'react'
import Inicio from './Inicio.jsx'

export default function App() {

    const issue = {
      id: '01',
      name: 'teste',
      type: 'Bug levantado',
      complexity: '3',
      screen: 'apis',
      creator: 'Lídia',
      open: 'Sim',
      status: 'Doing'
    };

    const projects = ['Dataself', 'Precatórios', 'Gaspar', 'GSI', 'Cotz']

  return <Inicio issue={issue} projects={projects} />;
}
