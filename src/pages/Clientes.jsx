import React, { useState, useEffect } from 'react';
import '../styles/clientes.css';
import Header from '../components/Header.jsx';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { Table, Button, Modal, Form, Input } from 'antd';
import { baseUrlClientes } from '../util/constantes';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";


// Botão de Voltar para Mobile

const Bvoltar = () => {
  return (
    <a className="bvoltar" href="/Gerenciamento-de-Estoque/#/">
      <span>&#x2190;</span> Voltar
    </a>
  );
};

// Formulário de input

const InputForm = ({ onAdicionar }) => {
  const { control, handleSubmit, reset } = useForm();

  const onSubmit = (data) => {
    onAdicionar(data);
    reset();
  };

  return (
    <div className="input-container">
      <div className="titulo-container">Clientes</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-row">
          <label htmlFor="nome">Nome:</label>
          <Controller
            name="nome"
            control={control}
            defaultValue=""
            render={({ field }) => <input type="text" {...field} placeholder="Digite o nome" />}
          />
        </div>
        <div className="input-row">
          <label htmlFor="email">Email:</label>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => <input type="email" {...field} placeholder="Digite o email" />}
          />
        </div>
        <div className="input-row">
          <label htmlFor="telefone">Telefone:</label>
          <Controller
            name="telefone"
            control={control}
            defaultValue=""
            render={({ field }) => <input type="tel" {...field} placeholder="Digite o telefone" />}
          />
        </div>
        <div className="input-row">
          <label htmlFor="endereco">Endereço:</label>
          <Controller
            name="endereco"
            control={control}
            defaultValue=""
            render={({ field }) => <input type="text" {...field} placeholder="Digite o endereço" />}
          />
        </div>
        <button id="adicionar" className="buttonc" type="submit">
          Adicionar Cliente
        </button>
      </form>
    </div>
  );
};

// Modal para Edição de Clientes
const EditarClienteModal = ({ cliente, open, onCancel, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(cliente);
  }, [cliente, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error('Erro ao validar o formulário:', error);
    }
  };

  return (
    <Modal
      title="Editar Cliente"
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
    >
      <Form form={form}>
        <Form.Item
          name="nome"
          label="Nome"
          rules={[{ required: true, message: 'Por favor, insira o nome do cliente!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Por favor, insira o email do cliente!' },
            { type: 'email', message: 'Por favor, insira um email válido!' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="telefone"
          label="Telefone"
          rules={[
            { required: true, message: 'Por favor, insira o telefone do cliente!' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="endereco"
          label="Endereço"
          rules={[{ required: true, message: 'Por favor, insira o endereço do cliente!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Barra de pesquisa por nome

const BarraPesquisa = ({ pesquisaNome, onPesquisaNomeChange, onPesquisar }) => {
  return (
    <div className="barra-pesquisa">
      <span>Pesquisar por nome:</span>
      <input
        type="text"
        id="pesquisar"
        placeholder="Digite o nome"
        value={pesquisaNome}
        onChange={onPesquisaNomeChange}
        onKeyDown={(e) => e.key === 'Enter' && onPesquisar()}
      />
    </div>
  );
};

// Tabela com a lista de clientes 

const ListaClientes = ({ clientes, onEditarCliente, onExcluirCliente }) => {
  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      render: (text) => text || '---',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '---',
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone',
      key: 'telefone',
      render: (text) => text || '---',
    },
    {
      title: 'Endereço',
      dataIndex: 'endereco',
      key: 'endereco',
      render: (text) => text || '---',
    },
    {
      title: 'Editar',
      key: 'editar',
      render: (text, record) => (
        <Button onClick={() => onEditarCliente(record)}>Editar</Button>
      ),
    },
    {
      title: 'Excluir',
      key: 'excluir',
      render: (text, record) => (
        <Button onClick={() => onExcluirCliente(record.key)}>Excluir</Button>
      ),
    },
  ];

  return <Table columns={columns} dataSource={clientes} />;
};

////// Componente Final

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [pesquisaNome, setPesquisaNome] = useState('');
  const [clientesOriginal, setClientesOriginal] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [editarModalVisivel, setEditarModalVisivel] = useState(false);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const token = useSelector((state) => state.token)
  
  const config = {
     headers: {
       'Authorization': 'Bearer ' + token
     }
   };  
 
  useEffect(() => {    
    atualizaLista();
  }, []);

  // redirecionamento se não estiver logado

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Login")
      return navigate("/login");
    }
  }, [token]);

  // Atualiza a tabela caso um comando seja executado

  function atualizaLista() {
    axios.get(baseUrlClientes, config)
      .then((response) => {
        if (response.status == 200) {
          const dados = response.data.data;
          let dadosProcessados = dados.map((cliente) => {
            return {
              key: cliente.id,
              nome: cliente.attributes.nome,
              email: cliente.attributes.email,
              telefone: cliente.attributes.telefone,
              endereco: cliente.attributes.endereco,
            }
          });
          setClientes(dadosProcessados);
          setClientesOriginal(dadosProcessados);
          setClientesFiltrados(dadosProcessados);
          console.log("Recebeu a lista de clientes!");
        } else {
          console.log("TOKENNN: ", config);
          alert("Houve um erro na conexão com o servidor!")
        }
      })
      .catch((error) => {
        console.log("TOKENNN: ", config);
        console.log(error)
        alert("Houve um erro na conexão com o servidor!")
      });
  }

  // Faz o modal de edição funcionar corretamente

  const handleEditarCliente = (cliente) => {
    const index = clientes.indexOf(cliente);
    setClienteEditando(index);
    setEditarModalVisivel(true);
  };

  // Função para adicionar clientes

  const adicionarCliente = (data) => {
    if (data.nome && data.email && data.telefone && data.endereco) {
      const novoCliente = {
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
        },
      };

      axios.post(baseUrlClientes, novoCliente, config)
        .then((response) => {
          if (response.status === 200) {
            alert("Cliente adicionado com sucesso!");
            atualizaLista();
          } else {
            console.error('Erro de servidor:', response);
          }
        })
        .catch((error) => {
          console.error('Erro ao adicionar o cliente:', error);
        });
    }
  };

  // Função para editar os clientes

  const editarCliente = (clienteEditado) => {
    const novosClientes = [...clientes];
    novosClientes[clienteEditando] = { ...novosClientes[clienteEditando], ...clienteEditado };

    // Objeto com apenas os campos que serão editados
    const camposEditados = {};
    if (clienteEditado.nome) {
      camposEditados.nome = clienteEditado.nome;
    }
    if (clienteEditado.email) {
      camposEditados.email = clienteEditado.email;
    }
    if (clienteEditado.telefone) {
      camposEditados.telefone = clienteEditado.telefone;
    }
    if (clienteEditado.endereco) {
      camposEditados.endereco = clienteEditado.endereco;
    }

    axios.put(baseUrlClientes + `/${novosClientes[clienteEditando].key}`, { data: camposEditados }, config)
      .then((response) => {
        if (response.status === 200) {
          setClientes(novosClientes);
          setClientesOriginal(novosClientes);
          setClientesFiltrados(novosClientes);
        } else {
          console.error('Erro de servidor:', response);
        }
      })
      .catch((error) => {
        console.error('Erro ao editar o cliente:', error);
      });
  };

  // Função para excluir os clientes
  const excluirCliente = (clienteId) => {
    console.log(clienteId);

    // Fazer uma chamada à API para verificar se existem clientes relacionados a vendas
    axios.get(baseUrlClientes + `/${clienteId}/?populate=vendas`, config)
      .then((response) => {
        if (response.status === 200) {
          const clienteExcluidoNome = response.data.data.attributes.nome;
          const vendasRelacionadas = response.data.data.attributes.vendas.data;
          console.log('Cliente relacionados à vendas:', vendasRelacionadas);

          if (vendasRelacionadas.length > 0) {
            //Se existe, erro
            alert('Não é possível excluir o cliente, pois existem vendas cadastradas relacionados ao cliente.');
          } else {
            // Não existem, nesse caso se pode excluir
            confirmarExclusaoCliente(clienteId, clienteExcluidoNome);
          }
        } else {
          console.error('Erro ao verificar produtos relacionados:', response);
        }
      })
      .catch((error) => {
        console.error('Erro ao verificar produtos relacionados:', error);
      });
  };

  // Função para confirmar a exclusão do cliente 
  const confirmarExclusaoCliente = (clienteId, clienteExcluidoNome) => {
    const confirmarExclusao = window.confirm(`Tem certeza de que deseja excluir o cliente: ${clienteExcluidoNome}?`);
    if (confirmarExclusao) {
      axios.delete(baseUrlClientes + `/${clienteId}`, config)
        .then((response) => {
          if (response.status === 200) {
            atualizaLista();
          } else {
            console.error('Erro na resposta da API ao excluir o cliente');
          }
        })
        .catch((error) => {
          console.error('Erro ao fazer a chamada da API para excluir o cliente:', error);
        });
    }
  };

  // Lógica de Pesquisar Clientes
  const pesquisarCliente = () => {
    const nomePesquisado = pesquisaNome.trim().toLowerCase();
    const resultadoPesquisa = clientesOriginal.filter((cliente) =>
      cliente.nome.toLowerCase().includes(nomePesquisado)
    );
    setClientesFiltrados(resultadoPesquisa);
  };


  return (
    <div>
      <Header />
      <Bvoltar />
      <div className="container">
        <InputForm
          nome={nome}
          email={email}
          telefone={telefone}
          endereco={endereco}
          onNomeChange={(e) => setNome(e.target.value)}
          onEmailChange={(e) => setEmail(e.target.value)}
          onTelefoneChange={(e) => setTelefone(e.target.value)}
          onEnderecoChange={(e) => setEndereco(e.target.value)}
          onAdicionar={adicionarCliente}
        />
        <BarraPesquisa
          pesquisaNome={pesquisaNome}
          onPesquisaNomeChange={(e) => setPesquisaNome(e.target.value)}
          onPesquisar={pesquisarCliente}
        />
        <ListaClientes
          clientes={clientesFiltrados}
          onEditarCliente={handleEditarCliente}
          onExcluirCliente={excluirCliente}
        />
        <EditarClienteModal
          cliente={clientes[clienteEditando]}
          open={editarModalVisivel}
          onCancel={() => setEditarModalVisivel(false)}
          onSave={(clienteEditado) => {
            editarCliente(clienteEditado, clienteEditando);
            setEditarModalVisivel(false);
          }}
        />
      </div>
    </div>
  );
};

export default Clientes;