import React, { useState, useEffect } from 'react';
import '../styles/login.css';
import '../App.css';

import { useDispatch } from 'react-redux';
import { definirToken } from '../redux/loginSlice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const logar = () => {
    axios.post('https://projeto.viniciuscavalc6.repl.co/api/auth/local', formData)
      .then((response) => {
        if (response.status === 200) {
          dispatch(definirToken(response.data.jwt));
          console.log("Login realizado com sucesso!");
          console.log("Token de Usuário: ", response.data.jwt);
          return navigate("/");
        } else {
          alert("Falha de login!");
        }
      })
      .catch((error) => {
        alert("Falha de login");
        console.log(error);
      });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    setFormData({
      identifier: '',
      password: '',
    });
  };

  return (
    <main>
      <div className="login-container">
        <form className="login-form" onSubmit={handleFormSubmit}>
          <div className="user-icon"></div>

          <label htmlFor="identifier">Email:</label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <button type="submit" onClick={logar} className="button login-button">
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
};

export default Login;
