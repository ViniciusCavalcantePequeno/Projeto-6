import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { Table, Button, Modal, Space, Select } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../styles/agendados.css';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';


// Container de pesquisa
const PesquisaBarra = ({ pesquisaNome, pesquisaData, atualizaLista, config }) => {
  const [tipoPesquisa, setTipoPesquisa] = useState("nome");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [opcoesClientes, setOpcoesClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [aluguelSelecionado, setAluguelSelecionado] = useState("");
  const [pesquisaNomeCliente, setPesquisaNomeCliente] = useState("");

  useEffect(() => {
    // Get para opção de Clientes
    axios.get('https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-clientes', config)
      .then((response) => {
        if (response.status === 200) {
          const dadosClientes = response.data.data;
          let dadosProcessadosClientes = dadosClientes.map((cliente) => {
            return {
              value: cliente.id,
              label: cliente.attributes.nome,
            };
          });
          setOpcoesClientes(dadosProcessadosClientes); // Armazene as opções de clientes no estado
        } else {
          console.error('Erro na resposta da API');
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer a chamada da API:', error);
      });
  }, []);

  const handleTipoPesquisaChange = (event) => {
    setTipoPesquisa(event.target.value);
    setClienteSelecionado("");
    setAluguelSelecionado("");
    setPesquisaNomeCliente("");
    setDataInicial("");
    setDataFinal("");
  };

  const handlePesquisa = () => {
    console.log("Tipo de pesquisa:", tipoPesquisa);

    if (tipoPesquisa === "nome" && clienteSelecionado) {
      console.log("Cliente selecionado:", clienteSelecionado);
      pesquisaNome(clienteSelecionado);
    }

    if (tipoPesquisa === "data" && dataInicial && dataFinal) {
      console.log("Data Inicial:", dataInicial);
      console.log("Data Final:", dataFinal);
      pesquisaData(dataInicial, dataFinal);
    }
  };

  const resetarPesquisa = () => {
    atualizaLista();
  };

  return (
    <div className="barra-pesquisa-aluguel">
      <span>Pesquisar por:</span>
      <select id="tipo-pesquisa" style={{ marginRight: '10px' }} onChange={(e) => setTipoPesquisa(e.target.value)} value={tipoPesquisa}>
        <option value="nome">Nome do Cliente</option>
        <option value="data">Data de Devolução</option>
      </select>

      {tipoPesquisa === "nome" && (
        <select id="clientes" style={{ marginRight: '10px' }} onChange={(e) => setClienteSelecionado(e.target.value)} value={clienteSelecionado}>
          <option value="">Selecione um cliente</option>
          {opcoesClientes.map((cliente) => (
            <option key={cliente.value} value={cliente.value}>
              {cliente.label}
            </option>
          ))}
        </select>
      )}

      {tipoPesquisa === "data" && (
        <div>
          <input
            type="date"
            id="data-inicial"
            style={{ marginRight: '5px' }}
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
          />
          <input
            type="date"
            id="data-final"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
          />
        </div>
      )}


      <button id="pesquisar-button" style={{ marginLeft: '5px', marginRight: '5px' }} onClick={handlePesquisa}>Pesquisar</button>
      <button id="resetar-pesquisa-button" onClick={resetarPesquisa}>Resetar Tabela</button>
    </div>
  );
};

// Tabela do aluguel

const TableAluguel = ({ data, setData, atualizaLista, config }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [Alugueis, setAlugueis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [deleteModalContent, setDeleteModalContent] = useState(null);
  const [opcoesClientes, setOpcoesClientes] = useState([]);
  const [concluido, setConcluido] = useState(false);


  useEffect(() => {
    atualizaLista();

    // Get clientes
    axios.get('https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-clientes', config)
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

  const obterAlugueis = (aluguelId) => {
    return new Promise((resolve, reject) => {
      axios
        .get(`https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis?filters[id][$eq]=${aluguelId}&populate=*`, config)
        .then((response) => {
          if (response.status === 200) {
            const dadosAlugueis = response.data.data;
            console.log(dadosAlugueis);
            let dadosProcessadosAlugueis = dadosAlugueis.map((aluguel) => {
              return {
                key: aluguel.id,
              };
            });
            console.log(dadosProcessadosAlugueis);
            setAlugueis(dadosProcessadosAlugueis);
            resolve(dadosProcessadosAlugueis);
          } else {
            alert("Houve um erro de conexão com o servidor!");
            reject("Erro na conexão com o servidor");
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  };

  // Editar ALugueis

  const editarAluguel = (aluguelEditada) => {
    console.log("Aluguel (Editado) Recebida: ", aluguelEditada);

    const camposEditados = {};
    if (aluguelEditada.cliente && typeof aluguelEditada.cliente !== 'string') {
      camposEditados.cliente = aluguelEditada.cliente;
    }
    if (aluguelEditada.data_aluguel) {
      camposEditados.data_aluguel = aluguelEditada.data_aluguel;
    }
    if (aluguelEditada.data_devolucao) {
      camposEditados.data_devolucao = aluguelEditada.data_devolucao;
    }
    if (aluguelEditada.data_efetiva_entrega) {
      camposEditados.data_efetiva_entrega = aluguelEditada.data_efetiva_entrega;
    }
    if (aluguelEditada.quantidade_pecas) {
      camposEditados.quantidade_pecas = aluguelEditada.quantidade_pecas;
    }
    if (aluguelEditada.anotacoes_aluguel) {
      camposEditados.anotacoes_aluguel = aluguelEditada.anotacoes_aluguel;
    }
    if (aluguelEditada.valor_adiantado) {
      camposEditados.valor_adiantado = aluguelEditada.valor_adiantado;
    }
    if (aluguelEditada.valor_faltando) {
      camposEditados.valor_faltando = aluguelEditada.valor_faltando;
    }
    if (aluguelEditada.concluido && typeof aluguelEditada.concluido !== 'string') {
      camposEditados.concluido = aluguelEditada.concluido;
    }

    axios.put(`https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis/${aluguelEditada.key}`, { data: camposEditados }, config)
      .then((response) => {
        if (response.status === 200) {
          console.log("ALUGUEL EDITADO. Status: ", response.status);
          atualizaLista();
        } else {
          console.error('Erro de servidor:', response);
        }
      })
      .catch((error) => {
        console.log("Campos Editados: ", camposEditados);
        console.error('Erro ao editar :', error);
      });
  };

  // Excluir ALugueis

  const excluirAluguel = (aluguelId) => {
    axios.delete(`https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis/${aluguelId}`, config)
      .then((response) => {
        atualizaLista();
      })
      .catch((error) => {
        console.error('Erro ao excluir o aluguel:', error);
      });
  };

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'Data da Devolução',
      dataIndex: 'data_devolucao',
      key: 'data_devolucao',
    },
    {
      title: 'Data de Aluguel',
      dataIndex: 'data_aluguel',
      key: 'data_aluguel',
    },
    {
      title: 'Valor Adiantado (R$)',
      dataIndex: 'valor_adiantado',
      key: 'valor_adiantado',
    },
    {
      title: 'Valor Faltando (R$)',
      dataIndex: 'valor_faltando',
      key: 'valor_faltando',
    },
    {
      title: 'Concluido',
      dataIndex: 'concluido',
      key: 'concluido',
    },
    {
      title: 'Data Efetiva da Entrega',
      dataIndex: 'data_efetiva_entrega',
      key: 'data_efetiva_entrega',
    },
    {
      title: 'Quantidade de Peças',
      dataIndex: 'quantidade_pecas',
      key: 'quantidade_pecas',
    },
    {
      title: 'Tipos das Peças',
      dataIndex: 'anotacoes_aluguel',
      key: 'anotacoes_aluguel',
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Editar
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => showDeleteModal(record)}>
            Excluir
          </Button>
        </Space>
      ),
    }
  ];

  const showEditModal = (record) => {    
    const [dayD, monthD, yearD] = record.data_devolucao.split('/');
    let data_devolucao = (new Date([monthD, dayD, yearD].join('/'))).toISOString().split('T')[0];
    const [dayA, monthA, yearA] = record.data_aluguel.split('/');
    let data_aluguel = (new Date([monthA, dayA, yearA].join('/'))).toISOString().split('T')[0];
    let data_efetiva_entrega = record.data_efetiva_entrega;

    if (record.data_efetiva_entrega != null) {
      const [dayE, monthE, yearE] = record.data_efetiva_entrega.split('/');
      data_efetiva_entrega = (new Date([monthE, dayE, yearE].join('/'))).toISOString().split('T')[0];
    }    

    setLoading(true);

    obterAlugueis(record.key).then((aluguelId) => {
      const modalContent = (
        <div>
          <h3>Aluguel</h3>
          <div>
            <label htmlFor="editCliente">Cliente:</label>
            <Select
              id="editCliente"
              style={{
                marginLeft: '108px',
              }}
              defaultValue={record.cliente}
              onChange={(value) => (record.cliente = value)}
            >
              {opcoesClientes.map((cliente) => (
                <Select.Option key={cliente.value} value={cliente.value}>
                  {cliente.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="editDataAluguel">Data do Aluguel:</label>
            <input
              type="date"
              id="editDataAluguel"
              style={{
                marginLeft: '50px',
              }}
              defaultValue={data_aluguel}
              onChange={(e) => (record.data_aluguel = e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editDataDevolucao">Data de Devolução:</label>
            <input
              type="date"
              id="editDataDevolucao"
              style={{
                marginLeft: '34px',
              }}
              defaultValue={data_devolucao}
              onChange={(e) => (record.data_devolucao = e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editQuantPecas">Quantidade de Peças:</label>
            <input
              type="number"
              step="0.01"
              id="editQuantPecas"
              style={{
                marginLeft: '20px',
              }}
              defaultValue={record.quantidade_pecas}
              onChange={(e) => (record.quantidade_pecas = parseInt(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="editTiposPecas">Tipos das Peças:</label>
            <input
              type="text"
              step="0.01"
              id="editTiposPecas"
              style={{
                marginLeft: '53px',
              }}
              defaultValue={record.anotacoes_aluguel}
              onChange={(e) => (record.anotacoes_aluguel = e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editValorFaltando">Valor Faltando (R$):</label>
            <input
              type="number"
              step="0.01"
              id="editValorFaltando"
              style={{
                marginLeft: '33px',
              }}
              defaultValue={record.valor_faltando}
              onChange={(e) => (record.valor_faltando = parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="editValorAdiantado">Valor Adiantado (R$):</label>
            <input
              type="number"
              step="0.01"
              id="editValorAdiantado"
              style={{
                marginLeft: '22px',
              }}
              defaultValue={record.valor_adiantado}
              onChange={(e) => (record.valor_adiantado = parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="editDataEfetiva">Data Efetiva:</label>
            <input
              type="date"
              id="editDataEfetiva"
              style={{
                marginLeft: '76px',
              }}
              defaultValue={data_efetiva_entrega}
              onChange={(e) => (record.data_efetiva_entrega = e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editConcluido">Concluido:</label>
            <input
              type="checkbox"
              value={concluido}
              onClick={() => setConcluido(!concluido)}
              id="editConcluido"
              style={{
                marginLeft: '87px',
              }}
              defaultValue={false}
              onChange={(e) => (record.concluido = concluido ? true : false)}
            />
          </div>
        </div>
      );

      setDeleteModalContent(modalContent);
      setLoading(false);

      Modal.confirm({
        title: 'Editor de Aluguel',
        content: modalContent,
        onOk() {
          editarAluguel(record);
        },
        onCancel() {
          // ...
        },
      });
    });
  };

  // Modal de Deletar

  const showDeleteModal = (record) => {
    setLoading(true);

    obterAlugueis(record.key).then((Alugueis) => {
      const modalContent = (
        <div>
          <h3>Aluguel</h3>
          <ul>
            <li><strong>Cliente:</strong> {record.cliente}</li>
            <li><strong>Data de Devolução:</strong> {record.data_devolucao}</li>
            <li><strong>Data de Aluguel:</strong> {record.data_aluguel}</li>
            <li><strong>Valor Adiantado:</strong> {record.valor_adiantado}</li>
            <li><strong>Valor Faltando:</strong> {record.valor_faltando}</li>
            <li><strong>Quantidade de Peças:</strong> {record.quantidade_pecas}</li>
            <li><strong>Tipos das Peças:</strong> {record.anotacoes_aluguel}</li>
            <li><strong>Concluido:</strong> {record.concluido}</li>
            <li><strong>Data Efetiva:</strong> {record.data_efetiva_entrega}</li>
          </ul>
        </div>
      );

      setDeleteModalContent(modalContent);
      setLoading(false);

      Modal.confirm({
        title: 'Tem certeza que deseja excluir?',
        content: modalContent,
        onOk() {
          excluirAluguel(record.key);
        },
        onCancel() {
        },
      });
    });
  };

  return (
    <div>
      <Table dataSource={data} columns={columns} pagination={{ pageSize: 4 }} />
    </div>
  );
};

// Componente principal

const Agendados = () => {
  const [data, setData] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [detailsRecord, setDetailsRecord] = useState(null);

  // token de login

  const token = useSelector((state) => state.token)

  const config = {
     headers: {
       'Authorization': 'Bearer ' + token
     }
   };  

  useEffect(() => {    
    atualizaLista();
  }, []);

  // redirecionamento

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Login")
      return navigate("/login");
    }
  }, [token]);

  // atualizar lista

  function atualizaLista() {
    axios.get(`https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis?sort=data_devolucao:asc&filters[concluido]=false&populate=*`, config)

      .then((response) => {
        if (response.status === 200) {
          const dados = response.data.data;
          console.log(dados);
          let dadosProcessados = dados.map((Aluguel) => {
            return {
              key: Aluguel.id,
              cliente: Aluguel.attributes.cliente.data.attributes.nome,
              data_devolucao: Aluguel.attributes.data_devolucao,
              data_aluguel: Aluguel.attributes.data_aluguel,
              valor_adiantado: Aluguel.attributes.valor_adiantado,
              valor_faltando: Aluguel.attributes.valor_faltando,
              concluido: Aluguel.attributes.concluido ? "Sim" : "Não",
              data_efetiva_entrega: Aluguel.attributes.data_efetiva_entrega,
              quantidade_pecas: Aluguel.attributes.quantidade_pecas,
              anotacoes_aluguel: Aluguel.attributes.anotacoes_aluguel,
            }
          });
          console.log(dadosProcessados);
          setData(dadosProcessados);
        } else {
          alert("Erro de Status da API");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Erro na requisição!");
      });
  }

  const showEditModal = (record) => {
    setEditingRecord(record);
    setEditModalVisible(true);
  };

  const showDeleteModal = (record) => {
    setDeleteRecord(record);
    setDeleteModalVisible(true);
  };

  const showDetailsModal = (record) => {
    setDetailsRecord(record);
    setDetailsModalVisible(true);
  };

  const handleEdit = () => {
    setEditModalVisible(false);
  };

  const pesquisaNome = (clienteId) => {
    axios.get(`https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis?sort=data_devolucao:asc&filters[concluido]=false&filters[cliente][id][$eq]=${clienteId}&populate=*`, config)
      .then((response) => {
        if (response.status === 200) {
          const dados = response.data.data;
          let dadosProcessados = dados.map((Aluguel) => {
            return {
              key: Aluguel.id,
              cliente: Aluguel.attributes.cliente.data.attributes.nome,
              data_devolucao: Aluguel.attributes.data_devolucao,
              data_aluguel: Aluguel.attributes.data_aluguel,
              valor_adiantado: Aluguel.attributes.valor_adiantado,
              valor_faltando: Aluguel.attributes.valor_faltando,
              concluido: Aluguel.attributes.concluido ? "Sim" : "Não",
              data_efetiva_entrega: Aluguel.attributes.data_efetiva_entrega,
              quantidade_pecas: Aluguel.attributes.quantidade_pecas,
              anotacoes_aluguel: Aluguel.attributes.anotacoes_aluguel,
            }
          });
          console.log("Pesquisa por nome: ", dadosProcessados);
          setData(dadosProcessados);
        } else {
          alert("Houve um erro na conexão com o servidor na pesquisa de nome!");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Houve um erro na conexão com o servidor na pesquisa de nome!");
      });
  }

  const pesquisaData = (dataInicio, dataFim) => {
    axios.get(`https://ideacao-backend-8ea0b764c21a.herokuapp.com/api/aluguel-alugueis?sort=data_devolucao:desc&filters[concluido]=false&filters[data_devolucao][$gte]=${dataInicio}&filters[data_devolucao][$lte]=${dataFim}&populate=*`, config)
      .then((response) => {
        if (response.status === 200) {
          const dados = response.data.data;
          let dadosProcessados = dados.map((Aluguel) => {
            return {
              key: Aluguel.id,
              cliente: Aluguel.attributes.cliente.data.attributes.nome,
              data_devolucao: Aluguel.attributes.data_devolucao,
              data_aluguel: Aluguel.attributes.data_aluguel,
              valor_adiantado: Aluguel.attributes.valor_adiantado,
              valor_faltando: Aluguel.attributes.valor_faltando,
              concluido: Aluguel.attributes.concluido ? "Sim" : "Não",
              data_efetiva_entrega: Aluguel.attributes.data_efetiva_entrega,
              quantidade_pecas: Aluguel.attributes.quantidade_pecas,
              anotacoes_aluguel: Aluguel.attributes.anotacoes_aluguel,
            }
          });
          console.log("Pesquisa por Data: ", dadosProcessados);
          setData(dadosProcessados);
        } else {
          alert("Houve um erro na conexão com o servidor!");
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Houve um erro na conexão com o servidor!");
      });
  }

  return (
    <div>
      {/* Header para computador */}
      <Header />

      {/* Barra de pesquisa */}
      <PesquisaBarra atualizaLista={atualizaLista} pesquisaNome={pesquisaNome} pesquisaData={pesquisaData} config={config} />

      {/* Tabela de aluguel */}
      <TableAluguel atualizaLista={atualizaLista} data={data} setData={setData} config={config} />

      {/* Modal de Edição */}
      <Modal
        title="Editar Aluguel"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEdit}
      >
        {/* Conteúdo do modal de edição */}
      </Modal>

      <Modal
        title="Confirmar Exclusão"
        open={deleteModalVisible}
        onOk={() => {
          setDeleteModalVisible(false);
        }}
        onCancel={() => setDeleteModalVisible(false)}
      >
        Tem certeza de que deseja excluir?
      </Modal>


    </div>
  );
};

export default Agendados;