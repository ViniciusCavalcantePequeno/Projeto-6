import React, { useEffect, useState } from 'react';

// Header

const Header = () => {
  
  return (
    <header className={`header`}>
      <div className="header-title">Vestidos & Ternos</div>
      <a className="button cadastro" href="cadastro">Cadastrar Aluguel</a>
      <a className="button concluidos" href="concluidos">Concluidos</a>
      <a className="button agendados" href="agendados">Agendados</a>
      <a className="button clientes" href="/">Cliente</a>
    </header>
  );
};

export default Header;