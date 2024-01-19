import React from 'react';
import { useDispatch } from 'react-redux';
import { definirToken } from '../redux/loginSlice';

const MenuLateral = ({ menuAberto }) => {
  const dispatch = useDispatch();

  return (
    <div className={`menu-lateral ${menuAberto ? 'aberto' : ''}`}>
      <a className="button nova-venda" href="/Gerenciamento-de-Estoque/#/vendas">Vendas</a>
      <a className="button relatorio" href="/Gerenciamento-de-Estoque/#/relatorios">Relatórios</a>
      <a className="button estoque" href="/Gerenciamento-de-Estoque/#/estoque">Estoque</a>
      <a className="button clientes" href="/Gerenciamento-de-Estoque/#/clientes">Cliente</a>

      <a className="header-button-sobre" onClick={ () => dispatch(definirToken("")) }>Deslogar</a>
    </div>
  );
};

export default MenuLateral;
