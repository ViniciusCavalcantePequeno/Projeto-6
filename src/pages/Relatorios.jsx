import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { Table, Button, Modal, Space, Select, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../styles/relatorios.css';
import { baseUrlClientes, baseUrlEstoque, baseUrlItems, baseUrlVendas, getParametersVendasPadrao } from '../util/constantes';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";



// Boltão para voltar a página principal

const Bvoltar = () => {
  return (
    <a className="bvoltar" href="/Gerenciamento-de-Estoque/#/">
      <span>&#x2190;</span> Voltar
    </a>
  );
};

// Barra de pesquisa

const PesquisaBarra = ({ pesquisaNome, pesquisaData, atualizaLista, config }) => {
  const [tipoPesquisa, setTipoPesquisa] = useState("nome");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [opcoesClientes, setOpcoesClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [pesquisaNomeCliente, setPesquisaNomeCliente] = useState("");

  useEffect(() => {
    // Get para opção de Clientes
    axios.get(baseUrlClientes, config)
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
    setProdutoSelecionado("");
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
    <div className="barra-pesquisa-venda">
      <span>Pesquisar por:</span>
      <select id="tipo-pesquisa" style={{ marginRight: '10px' }} onChange={(e) => setTipoPesquisa(e.target.value)} value={tipoPesquisa}>
        <option value="nome">Nome do Cliente</option>
        <option value="data">Data de Venda</option>
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

// Tabela de Vendas

const TableVendas = ({ data, setData, atualizaLista, config }) => {
  const [modalVisible, setModalVisible] = useState(false);  
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [deleteModalContent, setDeleteModalContent] = useState(null);
  const [opcoesClientes, setOpcoesClientes] = useState([]);
  const [opcoesProdutos, setOpcoesProdutos] = useState([]);

  useEffect(() => {
    atualizaLista();

    // Get para opções de Clientes
    axios.get(baseUrlClientes, config)
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

    // Get para Opções de Produtos
    axios.get(baseUrlEstoque, config)
      .then((response) => {
        if (response.status === 200) {
          const dadosProdutos = response.data.data;
          let dadosProcessadosProdutos = dadosProdutos.map((produto) => {
            return {
              value: produto.id,
              label: produto.attributes.descricao,
              preco: produto.attributes.preco,
              custo: produto.attributes.custo,
              quantidade: produto.attributes.quantidade,
            };
          });
          console.log(dadosProcessadosProdutos);
          setOpcoesProdutos(dadosProcessadosProdutos);
        } else {
          console.error('Erro na resposta da API de produtos');
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer a chamada da API de produtos:', error);
      });
  }, []);

  const obterProdutos = (vendaId) => {
    return new Promise((resolve, reject) => {
      axios
        .get(baseUrlItems + `?filters[venda][id][$eq]=${vendaId}&populate=*`, config)
        .then((response) => {
          if (response.status === 200) {
            const dadosProdutos = response.data.data;
            console.log(dadosProdutos);
            let dadosProcessadosProdutos = dadosProdutos.map((produto) => {
              return {
                key: produto.id,
                produto: produto.attributes.produto.data.attributes.descricao,
                custo_venda: produto.attributes.custo_venda.toFixed(2),
                preco_venda: produto.attributes.preco_venda.toFixed(2),
                quantidade_vendida: produto.attributes.quantidade_vendida,
              };
            });
            console.log(dadosProcessadosProdutos);
            setProdutos(dadosProcessadosProdutos);
            resolve(dadosProcessadosProdutos);
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

  // Editar Venda

  const editarVenda = (vendaEditada) => {
    console.log("Venda (Editada) Recebida: ", vendaEditada);

    const camposEditados = {};
    if (vendaEditada.cliente && typeof vendaEditada.cliente !== 'string') {
      camposEditados.cliente = vendaEditada.cliente;
    }
    if (vendaEditada.data) {
      camposEditados.data = vendaEditada.data;
    }
    if (vendaEditada.pagamento) {
      camposEditados.pagamento = vendaEditada.pagamento;
    }
    if (vendaEditada.entrega) {
      camposEditados.entrega = vendaEditada.entrega;
    }
    if (vendaEditada.desconto) {
      camposEditados.desconto = vendaEditada.desconto;
    }

    axios.put(baseUrlVendas + `/${vendaEditada.key}`, { data: camposEditados }, config)
      .then((response) => {
        if (response.status === 200) {
          console.log("VENDA EDITADA. Status: ", response.status);
          atualizaLista();
        } else {
          console.error('Erro de servidor:', response);
        }
      })
      .catch((error) => {
        console.log("Campos Editados: ", camposEditados);
        console.error('Erro ao editar a venda:', error);
      });
  };

  const editarItemVenda = (itemEditado) => {
    console.log("Item Recebido: ", itemEditado);

    const camposEditados = {};
    if (itemEditado.produto && typeof itemEditado.produto !== 'string') {
      camposEditados.produto = itemEditado.produto;
    }
    if (itemEditado.quantidade_vendida) {
      camposEditados.quantidade_vendida = itemEditado.quantidade_vendida;
    }
    if (itemEditado.custo_venda) {
      camposEditados.custo_venda = itemEditado.custo_venda;
    }
    if (itemEditado.preco_venda) {
      camposEditados.preco_venda = itemEditado.preco_venda;
    }

    axios.put(baseUrlItems + `/${itemEditado.key}`, { data: camposEditados }, config)
      .then((response) => {
        if (response.status === 200) {
          console.log("Item editado com sucesso:, ", itemEditado.key);
          atualizaLista();
        } else {
          console.error('Erro de servidor:', response);
        }
      })
      .catch((error) => {
        console.error('Erro ao editar o item venda:', error);
      });
  };

  // Excluir Venda

  const excluirVenda = (vendaId) => {
    axios.delete(baseUrlVendas + `/${vendaId}`, config)
      .then((response) => {
        atualizaLista();
      })
      .catch((error) => {
        console.error('Erro ao excluir o produto:', error);
      });
  };

  const excluirProduto = (produtoId) => {
    axios.delete(baseUrlItems + `/${produtoId}`, config)
    .then((response) => {
      console.log("Produto excluido: ", produtoId);
    })
    .catch((error) => {
      console.error('Erro ao excluir o produto:', error);
    });
  };

  // Colunas

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
    },
    {
      title: 'Tipo de Pagamento',
      dataIndex: 'pagamento',
      key: 'pagamento',
    },
    {
      title: 'Valor de Entrega (R$)',
      dataIndex: 'entrega',
      key: 'entrega',
    },
    {
      title: 'Valor de Desconto (R$)',
      dataIndex: 'desconto',
      key: 'desconto',
    },
    {
      title: 'Ações',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<InfoCircleOutlined />} onClick={() => showDetailsModal(record)}>
            Detalhes
          </Button>
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

  // Modals

  const showEditModal = (record) => {
    setLoading(true);
  
    obterProdutos(record.key).then((produtos) => {
      const modalContent = (
        <div>
          <h3>Venda</h3>
          <div>
            <label htmlFor="editCliente">Cliente:</label>
            <Select
              id="editCliente"
              style={{ marginLeft: '105px' }}
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
            <label htmlFor="editData">Data:</label>
            <input
              type="date"
              id="editData"
              style={{ marginLeft: '120px' }}
              defaultValue={record.data}
              onChange={(e) => (record.data = e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="editPagamento">Tipo de Pagamento:</label>
            <Select
              id="editPagamento"
              style={{ marginLeft: '23px' }}
              defaultValue={record.pagamento}
              onChange={(value) => (record.pagamento = value)}
            >
              <Select.Option value="Pix">Pix</Select.Option>
              <Select.Option value="Crédito">Crédito</Select.Option>
              <Select.Option value="Débito">Débito</Select.Option>
              <Select.Option value="Dinheiro">Dinheiro</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="editEntrega" style={{ marginRight: '10px' }}>Valor da Entrega (R$):</label>
            <input
              type="number"
              step="0.01"
              id="editEntrega"
              defaultValue={record.entrega}
              onChange={(e) => (record.entrega = parseFloat(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="editDesconto" style={{ marginRight: '10px' }}>Valor do Desconto (R$):</label>
            <input
              type="number"
              step="0.01"
              id="editDesconto"
              defaultValue={record.desconto}
              onChange={(e) => (record.desconto = parseFloat(e.target.value))}
            />
          </div>
          <h3>Itens da Venda</h3>
          {produtos.map((produto, index) => (
            <div key={index} style={{ display: 'block', marginBottom: '1em' }}>
              <hr></hr>
              <div>
                <label htmlFor={`editProduto${index}`}>Produto:</label>
                <Select
                  id={`editProduto${index}`}
                  style={{ marginLeft: '90px' }}
                  defaultValue={produto.produto}
                  onChange={(value) => (produto.produto = value)}
                >
                  {opcoesProdutos.map((produtoOpcao) => (
                    <Select.Option key={produtoOpcao.value} value={produtoOpcao.value}>
                      {produtoOpcao.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor={`editCustoVenda${index}`} style={{ marginRight: '12px' }}>Preço do Cliente (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  id={`editCustoVenda${index}`}
                  defaultValue={produto.preco_venda}
                  onChange={(e) => (produto.preco_venda = parseFloat(e.target.value))}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor={`editPrecoVenda${index}`} style={{ marginRight: '12px' }}>Custo do Vendedor (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  id={`editPrecoVenda${index}`}
                  style={{ marginLeft: '-2px' }}
                  defaultValue={produto.custo_venda}
                  onChange={(e) => (produto.custo_venda = parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor={`editQuantidadeVendida${index}`}>Quantidade Vendida:</label>
                <input
                  type="number"
                  id={`editQuantidadeVendida${index}`}
                  style={{ marginLeft: '10px' }}
                  defaultValue={produto.quantidade_vendida}
                  onChange={(e) => (produto.quantidade_vendida = parseInt(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      );
  
      setDeleteModalContent(modalContent);
      setLoading(false);
  
      Modal.confirm({
        title: 'Editor de Venda',
        content: modalContent,
        onOk() {
          produtos.forEach((produto) => {
            editarItemVenda(produto);
          });
  
          editarVenda(record);
        },
        onCancel() {
          // ...
        },
      });
    });
  };

  const showDeleteModal = (record) => {
    setLoading(true);

    obterProdutos(record.key).then((produtos) => {
      const modalContent = (
        <div>
          <h3>Venda</h3>
          <ul>
            <li><strong>Cliente:</strong> {record.cliente}</li>
            <li><strong>Data:</strong> {record.data}</li>
            <li><strong>Tipo de Pagamento:</strong> {record.pagamento}</li>
            <li><strong>Valor de Entrega (R$):</strong> {record.entrega}</li>
            <li><strong>Valor de Desconto (R$):</strong> {record.desconto}</li>
          </ul>
          <h3>Itens da Venda</h3>
          {produtos.map((produto, index) => (
            <div key={index}>
              <strong>Produto:</strong> {produto.produto}<br />
              <strong>Preço do Cliente (R$):</strong> {produto.preco_venda}<br />
              <strong>Custo do Vendedor (R$):</strong> {produto.custo_venda}<br />
              <strong>Quantidade Vendida:</strong> {produto.quantidade_vendida}<br />
              {index < produtos.length - 1 && (
                <div style={{ marginBottom: '1em' }}> </div>
              )}
            </div>
          ))}
        </div>
      );

      setDeleteModalContent(modalContent);
      setLoading(false);

      Modal.confirm({
        title: 'Tem certeza que deseja excluir essa venda?',
        content: modalContent,
        onOk() {
          produtos.forEach((produto) => {
            excluirProduto(produto.key);
          });

          excluirVenda(record.key);
        },
        onCancel() {
        },
      });
    });
  };

  const showDetailsModal = (record) => {
    setLoading(true);
    obterProdutos(record.key).then((produtos) => {
      // Calcule o valor total da venda
      const totalVenda = produtos.reduce((total, produto) => {
        return total + produto.preco_venda * produto.quantidade_vendida;
      }, 0);

      const lucroReal = produtos.reduce((lucro, produto) => {
        return (
          (lucro +
          (produto.preco_venda - produto.custo_venda) * produto.quantidade_vendida)
          - (record.desconto/2)
        );
      }, 0);
    
      const modalContent = (
        <div>
          <h3>Itens da Venda</h3>
          {produtos.map((produto, index) => (
            <div key={index}>
              <strong>Produto:</strong> {produto.produto}<br />
              <strong>Preço do Cliente (R$):</strong> {produto.preco_venda}<br />
              <strong>Custo do Vendedor (R$):</strong> {produto.custo_venda}<br />
              <strong>Quantidade Vendida:</strong> {produto.quantidade_vendida}<br />
              <hr></hr>
              {index < produtos.length - 1 && (
                <div style={{ marginBottom: '10px' }}> </div>
              )}
            </div>
          ))}
          <div>
            <Tooltip title="Valor total pago pelo cliente." placement="right">
              <span><InfoCircleOutlined /> <strong>Venda Total (R$):</strong> {totalVenda.toFixed(2)}</span>
            </Tooltip>
          </div>
          <div>
          <Tooltip title="Saldo positivo real da venda." placement="right">
              <span><InfoCircleOutlined /> <strong>Lucro Real (R$):</strong> {lucroReal.toFixed(2)}</span>
            </Tooltip>
          </div>
        </div>
      );
      setModalContent(modalContent);
      setLoading(false);
      setModalVisible(true);
    });
  };
  

  return (
    <div>
      <Table dataSource={data} columns={columns} pagination={{ pageSize: 4 }} />
      {/* Modal de Detalhes */}
      <Modal
        title="Detalhes da Venda"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {loading ? ( // Se estiver carregando, exibe:
          <div>Carregando...</div>
        ) : (
          // Caso contrário, exibe o conteúdo do modal
          modalContent
        )}
      </Modal>
    </div>
  );
};

// Componente principal

const Relatorios = () => {
  const [data, setData] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [detailsRecord, setDetailsRecord] = useState(null);
  const token = useSelector((state) => state.token)

  const config = {
     headers: {
       'Authorization': 'Bearer ' + token
     }
   };

  // redirecionamento se não estiver logado

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.log("Login")
      return navigate("/login");
    }
  }, [token]);
  
  // receber tabela

  function atualizaLista() {
    axios.get(baseUrlVendas + getParametersVendasPadrao, config)
      .then((response) => {
        if (response.status === 200) {
          const dados = response.data.data;
          let dadosProcessados = dados.map((venda) => {
            return {
              key: venda.id,
              cliente: venda.attributes.cliente.data.attributes.nome,
              data: venda.attributes.data,
              pagamento: venda.attributes.pagamento,
              entrega: venda.attributes.entrega.toFixed(2),
              desconto: venda.attributes.desconto.toFixed(2),            }
          });
          console.log(dadosProcessados);
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
    axios.get(baseUrlVendas + `?sort=data:desc&filters[cliente][id][$eq]=${clienteId}&populate=*`, config)
      .then((response) => {
        if (response.status === 200) {
          const dados = response.data.data;
          let dadosProcessados = dados.map((venda) => {
            return {
              key: venda.id,
              cliente: venda.attributes.cliente.data.attributes.nome,
              data: venda.attributes.data,
              pagamento: venda.attributes.pagamento,
              entrega: venda.attributes.entrega.toFixed(2),
              desconto: venda.attributes.desconto.toFixed(2),            }
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
    axios.get(baseUrlVendas + `?sort=data:desc&filters[data][$gte]=${dataInicio}&filters[data][$lte]=${dataFim}&populate=*`, config)
      .then((response) => {
        if (response.status === 200) {
          const dados = response.data.data;
          let dadosProcessados = dados.map((venda) => {
            return {
              key: venda.id,
              cliente: venda.attributes.cliente.data.attributes.nome,
              data: venda.attributes.data,
              pagamento: venda.attributes.pagamento,
              entrega: venda.attributes.entrega.toFixed(2),
              desconto: venda.attributes.desconto.toFixed(2),            }
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

      {/* Botão para voltar a página inicial */}
      <Bvoltar />

      {/* Barra de pesquisa */}
      <PesquisaBarra atualizaLista={atualizaLista} pesquisaNome={pesquisaNome} pesquisaData={pesquisaData} config={config} />

      {/* Tabela de vendas */}
      <TableVendas atualizaLista={atualizaLista} data={data} setData={setData} config={config} />

      {/* Modal de Edição */}
      <Modal
        title="Editar Venda"
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
        Tem certeza de que deseja excluir esta venda?
      </Modal>

      {/* Modal de Detalhes */}
      <Modal
        title="Detalhes da Venda"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
      >
      </Modal>
    </div>
  );
};

export default Relatorios;