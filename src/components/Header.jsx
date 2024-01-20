import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { definirToken } from '../redux/loginSlice';

const Header = () => {
  const dispatch = useDispatch();
  
  return (
    <header className={`header`}>
      <a className="header-button-sobre" onClick={ () => dispatch(definirToken("")) }>Sair</a>
      <div className="header-title">Vestidos & Ternos</div>
      <a className="button cadastro" href="/Vestidos_e_Ternos/#/cadastro">Cadastrar Aluguel</a>
      <a className="button concluidos" href="/Vestidos_e_Ternos/#/concluidos">Concluidos</a>
      <a className="button agendados" href="/Vestidos_e_Ternos/#/agendados">Agendados</a>
      <a className="button clientes" href="/Vestidos_e_Ternos/#/">Cliente</a>
    </header>
  );
};

export default Header;