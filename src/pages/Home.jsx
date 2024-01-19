import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { definirToken } from '../redux/loginSlice';
import HeaderHome from '../components/HeaderHome.jsx';

const Botoes = () => {
  return (
    <div className="button-container">
      <Link className="button nova-venda" to="/vendas">
        Vendas
      </Link>
      <Link className="button estoque" to="/estoque">
        Estoque
      </Link>
      <Link className="button relatorio" to="/relatorios">
        Relatórios
      </Link>
      <Link className="button clientes" to="/clientes">
        Clientes
      </Link>
    </div>
  );
};

const LinkSobreMobile = () => {
  return <a className="button-sobre-mobile" href="/Gerenciamento-de-Estoque/#/sobre">Sobre</a>;
};

const Home = () => {
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Login");
      return navigate("/login");
    }
  }, [token]);

  return (
    <main>
      <HeaderHome />
      <LinkSobreMobile />
      <Botoes />
    </main>
  );
};

export default Home;
