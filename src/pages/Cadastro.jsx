import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import '../styles/cadastro.css';
import Header from '../components/Header.jsx';
import { Modal, Table, Button, Select } from 'antd';
import axios from 'axios';
import { 
    ERRO_SERVIDOR, 
    ERRO_PRODUTO_ITEM_VENDA,
    MSG_CAMPOS_OBRIGATORIOS, 
    MSG_VENDA_CADASTRO_SUCESSO,
    baseUrlClientes, 
    baseUrlEstoque, 
    baseUrlItems, 
    baseUrlVendas 
  } from '../util/constantes';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

const URL_CLIENTES_ORDENADOS = baseUrlClientes + '?sort=nome';
const URL_PRODUTOS_ORDENADOS = baseUrlEstoque + '?sort=descricao';
const URL_ITENS_VENDA = baseUrlItems + '?populate=*&filters[venda][id][$eq]=';

// Botão Voltar para Mobile 

const Bvoltar = () => {
  return (
    <a className="bvoltar" href="/Gerenciamento-de-Estoque/#/">
      <span>&#x2190;</span> Voltar
    </a>
  );
};

// Mensagem para link para relatórios

const LinkRelatorios = () => {
  return (
    <div>
      <a id="relatorios-link" href="/Gerenciamento-de-Estoque/#/relatorios">
        Ir para Relatórios
      </a>
    </div>
  );
};

// Modal

const ModalProdutos = ({ isModalVisible, handleCancel, opcoesProdutos, control, venda, config, hideModal, carregaClientes, carregaProdutos, limpaCampos }) => {
  const [produtoId, setProdutoId] = useState(null);
  const [precoVenda, setPrecoVenda] = useState("");
  const [custoVendedor, setCustoVendedor] = useState("");
  const [precoVendaF, setPrecoVendaF] = useState("");
  const [custoVendedorF, setCustoVendedorF] = useState("");
  const [produtoTableData, setProdutoTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const { Option } = Select;

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleCancelItens = () => {
    
    setPrecoVenda("");
    setCustoVendedor("");
    setPrecoVendaF("");
    setCustoVendedorF("");
    setProdutoTableData([]);
    
    document.getElementById("quantidade").value = "";
    
    handleCancel();
  }

  // Determina a quantidade atual no estoque
  const buscarQuantidadeDisponivel = (prod) => {
    const produto = opcoesProdutos.find((p) => p.value == prod);
    
    if (produto) {
      return produto.quantidade;
    }

    return 0;
  };

  // Atualiza a Tabela do Modal
  const atualizarTabelaItems = (vendaID) => {    
    console.log(URL_ITENS_VENDA + vendaID)
    axios.get(URL_ITENS_VENDA + vendaID, config)
    .then((response) => {
      if (response.status === 200) {
        const dadosItemVenda = response.data.data;
        
        let dadosProcessadosItemVenda = dadosItemVenda.map((itemvenda) => {
          return {
            key: itemvenda.id,
            produtoId: itemvenda.attributes.produto.data.id,
            produto: itemvenda.attributes.produto.data.attributes.descricao,
            quantidade_vendida: itemvenda.attributes.quantidade_vendida,
            custo_venda: itemvenda.attributes.custo_venda,
            preco_venda: itemvenda.attributes.preco_venda,
          };
        });
        setProdutoTableData(dadosProcessadosItemVenda);
      } else {
        console.error('Erro na resposta da API');
        alert(ERRO_SERVIDOR);
      }
    })
    .catch((error) => {
      console.error('Erro ao fazer a chamada da API:', error);
      alert(ERRO_SERVIDOR);
    });
  };

  // Cadastra o produto na tabela
  const handleCadastrarProduto = async () => {
    const prodCadastrado = produtoTableData.find( (produto) => produto.produtoId == produtoId );

    if (!prodCadastrado) {
    
      console.log(produtoId)
      const preco_venda = precoVenda;
      const custo_venda = custoVendedor;
      const quantidade_vendida = document.getElementById("quantidade").value;

      if (produtoId && preco_venda && custo_venda && quantidade_vendida) {
        const quantidadeDisponivel = await buscarQuantidadeDisponivel(produtoId);

        // Verifique se a quantidade vendida não excede a quantidade disponível no estoque
        if (quantidadeDisponivel >= quantidade_vendida) {
          const data = { produto: produtoId, preco_venda, custo_venda, quantidade_vendida };

          criarItemVenda(data);
        } else {
          alert('Quantidade não disponível! Estoque: ' + quantidadeDisponivel);
        }
      } else {
        alert(MSG_CAMPOS_OBRIGATORIOS);
      }
    } else {
      alert(ERRO_PRODUTO_ITEM_VENDA);
    }
  };

  // Faz o Post para ItemVenda
  const criarItemVenda = (data) => {
    const novoItem = {
      data: {
        venda: venda,
        produto: data.produto,
        preco_venda: data.preco_venda,
        custo_venda: data.custo_venda,
        quantidade_vendida: data.quantidade_vendida
      },
    };

    axios.post(baseUrlItems, novoItem, config)
      .then((response) => {
        if (response.status === 200) {
          atualizarTabelaItems(venda);
        } else {
          console.error('Erro de servidor:', response);
          alert(ERRO_SERVIDOR);
        }
      })
      .catch((error) => {
        console.error('Erro ao adicionar o item:', error);
        alert(ERRO_SERVIDOR);
      });
  };

  // Requisição Delete para ItemVenda
  const handleRemoverProduto = (itemvenda) => {
    axios.delete(baseUrlItems + `/${itemvenda.key}`, config)
    .then((response) => {
      if (response.status === 200) {
        atualizarTabelaItems(venda);
      } else {
        console.error('Erro na resposta da API ao excluir o item');
        alert(ERRO_SERVIDOR);
      }
    })
    .catch((error) => {
      console.error('Erro ao fazer a chamada da API para excluir a categoria:', error);
      alert(ERRO_SERVIDOR);
    });
  };

  // Operações para finalizar a venda quando o usuário clica em "Ok"
  const handleFinalizarVenda = () => {
    if (venda) {
      // Percorre a tabela e subtrai os items
      produtoTableData.forEach((item) => {
        const itemvendaId = item.key;
        const quantidadeVendida = item.quantidade_vendida;
        const prod = item.produtoId;

        atualizarEstoque(quantidadeVendida, prod);
      });

      alert(MSG_VENDA_CADASTRO_SUCESSO);
      carregaClientes();
      carregaProdutos();
      hideModal();
      return navigate("/relatorios");
    }
  };

  // Atualiza a quantidade atual do estoque
  const atualizarEstoque = async (quantidadeVendida, prod) => {
    const qtdDisponivel = buscarQuantidadeDisponivel(prod);
    const novaQuantidade = qtdDisponivel - quantidadeVendida;
    const camposEditados = {
      data: {
        quantidade: novaQuantidade
      }
    };
    axios.put(baseUrlEstoque + `/${prod}`, camposEditados, config)
      .then((response) => {
        if (response.status === 200) {
          console.log("Estoque atualizado com sucesso!");
        } else {
          console.error('Erro de servidor:', response);
          alert(ERRO_SERVIDOR);
        }
      })
      .catch((error) => {
        console.error('Erro na atualização do estoque', error);
        alert(ERRO_SERVIDOR);
      });
  };

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'produto',
      key: 'produto',
    },
    {
      title: 'Preco',
      dataIndex: 'preco_venda',
      key: 'preco',
    },
    {
      title: 'Custo',
      dataIndex: 'custo_venda',
      key: 'custo',
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade_vendida',
      key: 'quantidade',
    },
    {
      title: 'Ação',
      dataIndex: 'acao',
      key: 'acao',
      render: (text, record, index) => (
        <Button onClick={() => handleRemoverProduto(record)}>Remover</Button>
      ),
    },
  ];

  return (
    <Modal
      title="Produtos da Venda"
      open={isModalVisible}
      onCancel={handleCancelItens}
      onOk={handleFinalizarVenda}
      cancelText="Cancelar"
      okText="Salvar"
    >
      <label htmlFor="produto">Produto:</label>
        <Controller
          name="produto"
          control={control}
          render={({ field }) => (
            <Select
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              placeholder="Pesquisar produto..."
              onChange={(value) => {
                const produtoSelecionado = opcoesProdutos.find(
                  (produto) => produto.value == value
                );
                if (produtoSelecionado) {
                  setProdutoId(value);
                  setPrecoVenda(produtoSelecionado.preco.toString());
                  setCustoVendedor(produtoSelecionado.custo.toString());
                  setPrecoVendaF(
                    "R$ " + produtoSelecionado.preco.toFixed(2).replace(".", ",")
                  );
                  setCustoVendedorF(
                    "R$ " + produtoSelecionado.custo.toFixed(2).replace(".", ",")
                  );
                } else {
                  setPrecoVenda("");
                  setCustoVendedor("");
                  setPrecoVendaF("");
                  setCustoVendedorF("");
                }
              }}
              onSearch={handleSearch}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {opcoesProdutos.map((produto) => (
                <Option key={produto.value} value={produto.value}>
                  {produto.label}
                </Option>
              ))}
            </Select>
          )}
        />

      <div className="input-row-vendas">
        <label htmlFor="preco">Preço do Cliente:</label>
        { precoVendaF }
      </div>

      <div className="input-row-vendas">
        <label htmlFor="preco">Custo do Vendedor:</label>
        { custoVendedorF }
      </div>
    
      <div className="input-row-vendas">
        <label htmlFor="quantidade">Unidades Vendidas:</label>
        <Controller
          name="quantidade"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              id="quantidade"
              placeholder="Digite a quantidade vendida"
              {...field}
            />
          )}
        />
      </div>

      <Button onClick={handleCadastrarProduto}>Adicionar item</Button>
      <Table
        dataSource={produtoTableData}
        columns={columns}
        pagination={{ pageSize: 3 }}
      />
      <p>Aperte OK para finalizar a venda.</p>
    </Modal>
  );
};

// Componente Principal

const Cadastro = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm();
  const [opcoesClientes, setOpcoesClientes] = useState([]);
  const [opcoesProdutos, setOpcoesProdutos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vendaId, setVendaId] = useState(null);
  const token = useSelector((state) => state.token)
  
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  // Redirecionamento se não estiver logado
  useEffect(() => {
    if (!token) {
      return navigate("/login");
    }
  }, [token]);

  // Quando abre a página, carrega clientes e produtos
  useEffect(() => {
    carregaClientes();
    carregaProdutos();    
  }, []);

  const limpaCampos = () => {
    setVendaId(null);
  }

  const carregaClientes = () => {
    axios.get(URL_CLIENTES_ORDENADOS, config)
      .then((response) => {
        if (response.status === 200) {
          const dadosClientes = response.data.data;
          let dadosProcessadosClientes = dadosClientes.map((cliente) => {
            return {
              value: cliente.id,
              label: cliente.attributes.nome,
            };
          });
          setOpcoesClientes(dadosProcessadosClientes);
        } else {
          console.error('Erro na resposta da API');
          alert(ERRO_SERVIDOR);
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer a chamada da API:', error);
        alert(ERRO_SERVIDOR);
      });
  }

  const carregaProdutos = () => {
    axios.get(URL_PRODUTOS_ORDENADOS, config)
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
          setOpcoesProdutos(dadosProcessadosProdutos);
        } else {
          console.error('Erro na resposta da API de produtos');
          alert(ERRO_SERVIDOR);
        }
      })
      .catch((error) => {
        console.error('Erro ao fazer a chamada da API de produtos:', error);
        alert(ERRO_SERVIDOR);
      });
  }

  // Cadastra venda
  const onSubmit = (data) => {
    registrarVenda(data);
  };

  const registrarVenda = (data) => {
    if (data.cliente && data.pagamento && data.desconto && data.entrega && data.data) {
      const novaVenda = {
        data: {
          cliente: data.cliente,
          pagamento: data.pagamento,
          desconto: data.desconto.replace("R$ ","").replace(",","."),
          entrega: data.entrega.replace("R$ ","").replace(",","."),
          data: data.data,
        },
      };
      console.log(novaVenda);

      axios.post(baseUrlVendas, novaVenda, config)
        .then((response) => {
          if (response.status === 200) {
            setVendaId(response.data.data.id);
            showModal();
          } else {
            console.error('Erro de servidor:', response);
            alert(ERRO_SERVIDOR);
          }
        })
        .catch((error) => {
          console.error('Erro ao adicionar o cliente:', error);
          alert(ERRO_SERVIDOR);
        });
    } else {
      alert(MSG_CAMPOS_OBRIGATORIOS);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    if (vendaId) {
      
      let itensExcluidos = true;
      axios.get(URL_ITENS_VENDA + vendaId, config)
        .then( (response) => {
          if (response.status === 200) {
            const itens = response.data.data;
            itens.forEach ( (item) => {
              if (itensExcluidos) {
                axios.delete(baseUrlItems + `/${item.id}`, config)
                  .then( (response) => {
                    if (response.status !== 200) {
                      itensExcluidos = false;
                    }
                  })
                  .catch( (error) => {
                    itensExcluidos = false;
                  });
              }
            })
          }
        })

      axios
        .delete(baseUrlVendas + `/${vendaId}`, config)
        .then((response) => {
          if (response.status === 200) {
            hideModal();
            return navigate("/relatorios");
          } else {
            console.error('Erro na resposta da API ao cancelar a venda');
            alert(ERRO_SERVIDOR);
          }
        })
        .catch((error) => {
          console.error('Erro ao fazer a chamada da API para excluir a venda:', error);
          alert(ERRO_SERVIDOR);
        });
    } else {
      hideModal();
    }
  };

  return (
    <div>
      <Header />
      <Bvoltar />
      <div className="container-vendas">
        <div className="input-container-vendas">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-row-vendas">
              <label htmlFor="cliente">Cliente:</label>
              <Controller
                name="cliente"
                control={control}
                render={({ field }) => (
                  <select 
                    id="cliente" 
                    {...field}
                  >
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
            <div className="input-row-vendas">
              <label htmlFor="pagamento">Tipo de Pagamento:</label>
              <Controller
                name="pagamento"
                control={control}
                render={({ field }) => (
                  <select
                    id="pagamento"
                    {...field}
                  >
                    <option value="">Selecionar Pagamento</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Débito">Débito</option>
                  </select>
                )}
              />
            </div>
            <div className="input-row-vendas" id="valor-desconto-container">
              <label htmlFor="desconto">Desconto:</label>
              <Controller
                name="desconto"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    thousandSeparator=""
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    id="desconto"
                    placeholder="Digite o valor do desconto em R$"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-vendas" id="valor-desconto-container">
              <label htmlFor="entrega">Valor de Entrega:</label>
              <Controller
                name="entrega"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    thousandSeparator=""
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    id="entrega"
                    placeholder="Digite o valor da entrega em R$"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="input-row-vendas">
              <label htmlFor="data">Data de Venda:</label>
              <Controller
                name="data"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    id="data"
                    min="2024-01-01"
                    max="2050-12-31"
                    {...field}
                  />
                )}
              />
            </div>
            <button type="submit">
              Salvar
            </button>
          </form>
        </div>
      </div>
      <LinkRelatorios />
      <ModalProdutos
        isModalVisible={isModalVisible}
        handleCancel={handleCancel}
        opcoesProdutos={opcoesProdutos}
        onSubmit={onSubmit}
        control={control}
        venda={vendaId}
        config={config}
        hideModal={hideModal}
        carregaProdutos={carregaProdutos}
        carregaClientes={carregaClientes}
        limpaCampos={limpaCampos}
      />
    </div>
  );
};

export default Cadastro;