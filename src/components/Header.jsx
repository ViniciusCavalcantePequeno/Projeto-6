import React, { useState } from 'react';
import MenuLateral from './MenuLateral';

const Header = () => {
  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <div>
      <header className="header">
        <div className="menu-toggle" onClick={toggleMenu}>
          &#9776;
        </div>
        <div className="header-title">Sistema de Gerenciamento</div>
        <a className="header-button-sobre" href="/Gerenciamento-de-Estoque/#/sobre">
          Sobre
        </a>
      </header>
      <MenuLateral menuAberto={menuAberto} />
    </div>
  );
};

export default Header;