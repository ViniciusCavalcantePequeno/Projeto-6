import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import '../styles/cadastro.css';
import Header from '../components/Header.jsx';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

// Mensagem para link para relatórios

const MensagSucess = () => {
  return (
    <div>
      <div id="success-message" style={{ display: 'none' }}>
        Aluguel cadastrada com sucesso!
      </div>
    </div>
  );
};

// Componente Principal

const Cadastro = () => {
  const { control, handleSubmit } = useForm();
  const [opcoesClientes, setOpcoesClientes] = useState([]);
  const [opcoesProdutos, setOpcoesProdutos] = useState([]);
  const [aluguelId, setaluguelId] = useState(null);
  const [concluido, setConcluido] = useState(false);
  
  // token de login

  const token = useSelector((state) => state.token)

  const config = {
     headers: {
       'Authorization': 'Bearer ' + token
     }
   };  

  // redirecionamento

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Login")
      return navigate("/login");
    }
  }, [token]);

  // submit
  
  const onSubmit = (data) => {
    console.log(data);
    criarAluguel(data);
  };

  const criarAluguel = (data) => {
    console.log("Dados Recebidos pelo Form: ", data);
    if (data.cliente && data.quantidade_pecas && data.valor_adiantado && data.valor_faltando && data.data_aluguel && data.data_devolucao) {
      const novoAluguel = {
        data: {
          cliente: data.cliente,
          quantidade_pecas: data.quantidade_pecas,
          valor_adiantado: data.valor_adiantado,
          valor_faltando: data.valor_faltando,
          data_aluguel: data.data_aluguel,
          data_devolucao: data.data_devolucao,
          anotacoes_aluguel: data.anotacoes_aluguel,
          concluido: data.concluido,
          data_efetiva_entrega: data.data_efetiva_entrega,
        },
      };

      axios.post('https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis', novoAluguel, config)
        .then((response) => {
          if (response.status === 200) {
            alert("Aluguel Cadastrada com Sucesso!");
            console.log(response.data.data.id) // ID
            setaluguelId(response.data.data.id);
          } else {
            console.error('Erro de servidor:', response);
          }
        })
        .catch((error) => {
          console.error('Erro ao adicionar o cliente:', error);
        });
    }
  };

  useEffect(() => {
    // Get para opção de Clientes
    axios.get('https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-clientes?sort=nome:asc', config)
      .then((response) => {
        if (response.status === 200) {
          const dadosClientes = response.data.data;
          let dadosProcessadosClientes = dadosClientes.map((cliente) => {
            return {
              value: cliente.id,
              label: cliente.attributes.nome,
            };
          });
          console.log(dadosProcessadosClientes);
          setOpcoesClientes(dadosProcessadosClientes);
        } else {
          console.error('Erro na resposta da API');
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer a chamada da API:', error);
      });
  }, []);

  const handleCancel = () => {
    if (aluguelId) {
      axios
        .delete(`https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis/${aluguelId}`, config)
        .then((response) => {
          if (response.status === 200) {
            console.log("Aluguel apagada com sucesso!");
          } else {
            console.error('Erro na resposta da API ao cancelar o aluguel');
          }
        })
        .catch((error) => {
          console.error('Erro ao fazer a chamada da API para excluir o aluguel:', error);
        });
    }
  };

  return (
    <div>
      <Header />
      <div className="container-aluguel">
        <div className="input-container-aluguel">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-row-aluguel">
              <label htmlFor="cliente">Nome do Cliente:</label>
              <Controller
                name="cliente"
                control={control}
                render={({ field }) => (
                  <select id="cliente" {...field}>
                    <option value="">Selecionar Cliente</option>
                    {opcoesClientes.map((cliente) => (
                      <option key={cliente.value} value={cliente.value}>
                        {cliente.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div className="input-row-aluguel" id="valor-desconto-container">
              <label htmlFor="quantidade_pecas">Quantidade de peças:</label>
              <Controller
                name="quantidade_pecas"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    id="quantidade_pecas"
                    placeholder="Digite a quantidade de peças alugadas"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-aluguel" id="valor-desconto-container">
              <label htmlFor="anotacoes_aluguel">Quais os tipos de peças:</label>
              <Controller
                name="anotacoes_aluguel"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    id="anotacoes_aluguel"
                    placeholder="Digite os tipos das peças alugadas"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-aluguel" id="valor-desconto-container">
              <label htmlFor="valor_adiantado">Valor Adiantado:</label>
              <Controller
                name="valor_adiantado"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    id="valor_adiantado"
                    placeholder="Digite o valor adiantado"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-aluguel" id="valor-desconto-container">
              <label htmlFor="valor_faltando">Valor Faltando:</label>
              <Controller
                name="valor_faltando"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    id="valor_faltando"
                    placeholder="Digite o valor que vai ficar faltando"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-aluguel">
              <label htmlFor="data_aluguel">Data do Aluguel:</label>
              <Controller
                name="data_aluguel"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id="data_aluguel"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-aluguel">
              <label htmlFor="data_devolucao">Data de devolução:</label>
              <Controller
                name="data_devolucao"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id="data_devolucao"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-aluguel">
              <label htmlFor="concluido">Concluido:</label>
              <Controller
                name="concluido"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    value={concluido}
                    onClick={() => setConcluido(!concluido)}
                    id="concluido"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-aluguel">
              <label htmlFor="data_efetiva_entrega">Data efetiva da devolução:</label>
              <Controller
                name="data_efetiva_entrega"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id="data_efetiva_entrega"
                    {...field}
                  />
                )}
              />
            </div>
            
            <button type="submit">
              Criar Aluguel
            </button>
          </form>
        </div>
      </div>
      <MensagSucess />
    </div>
  );
};

export default Cadastro;