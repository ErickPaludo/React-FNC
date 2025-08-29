/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import validator from "validator";
import * as R from "ramda";
import "./App.css";
import icone from "./source/icone.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { addMonths, format, parseISO, subDays } from "date-fns";
import { Form, Table, Button, Row, Col,Modal } from "react-bootstrap";
import axios from "axios";
import { da, ro } from "date-fns/locale";

// Token global
let userToken: WebToken;

type WebToken = {
  token: string;
  refreshToken: string;
  expiration: string;
  id: string;
};

// Props
interface LoginProps {
  setTela: React.Dispatch<React.SetStateAction<number>>;
}

// Tipagens
type FinancaGeral = {
  divida: number;
  saldo: number;
};

type ValorCategoria = {
  categoria: string;
  valor: number;
};

type GastoDetalhado = {
  id: number;
  gpId: number;
  titulo: string;
  descricao: string;
  valor: number;
  dthr: string;
  parcela: string;
  categoria: string;
  status: string;
};

type DashboardFinanceiro = {
  financasGeral: FinancaGeral[];
  valores: ValorCategoria[];
  gastosDetalhados: GastoDetalhado[];
};
type Credito = {
  id: number;
  titulo: string;
  descricao: string;
  valor: number;
  valorIntegral: number;
  dthrReg: string;
  dataVencimento: string;
  totalParcelas: number;
  userId: string;
  tipo: string;
};

type Debito = {
  id: number;
  titulo: string;
  descricao: string;
  valor: number;
  dthrReg: string;
  status: string;
  userId: string;
};

type Saldo = {
  id: number;
  titulo: string;
  descricao: string;
  valor: number;
  dthrReg: string;
  status: string;
  userId: string;
  tipo: string;
};

// ---------------------------
// APP PRINCIPAL
// ---------------------------
function App() {
  const [tela, setTela] = useState(1); // 1 = Login, 2 = View

  return (
    <>
      {tela === 1 && <Login setTela={setTela} />}
      {tela === 2 && <View setTela={setTela} />}
    </>
  );
}

// ---------------------------
// LOGIN
// ---------------------------
function Login({ setTela }: LoginProps) {
  const [mostraSenha, setMostraSenha] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [msgErro, setMsgErro] = useState("");

  const validationLogin = (email: string, senha: string) => {
    if (!email || !senha) {
      setMsgErro("Preencha todos os campos");
      return false;
    }

    axios
      .post("http://100.96.1.2:3000/api/Auth/login", {
        userName: email,
        password: pass,
      })
      .then((response) => {
        if (response.status === 200) {
          userToken = {
            token: response.data.token,
            expiration: response.data.expiration,
            id: response.data.id,
            refreshToken: response.data.refreshToken,
          };

          setMsgErro("");
          setTela(2);
          return true;
        }
      })
      .catch((error) => {
        if (error.status === 401) {
          setMsgErro("Usuário ou senha inválidos!");
          return false;
        }
        setMsgErro("Ocorreu um erro!");
        return false;
      });

    return true;
  };

  return (
    <div className="d-flex justify-content-center" style={{ marginTop: "20vh"}}>
    <div  className="mt-5 border p-5 bg-light text-dark shadow-sm bg-body-tertiary rounded d-flex justify-content-center gap-5" style={{ width: "100%", maxWidth: "800px" }}>
      <img src={icone} className="img-fluid d-none d-md-block w-50" alt="icone" />
      <Form style={{ width: "100%", maxWidth: "500px" }}>
        <Form.Label className="d-flex justify-content-center">FNC Project</Form.Label>
        {/* Username */}
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label className="d-flex justify-content-start">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            onChange={(e) => setUser(e.target.value)}
          />
        </Form.Group>

        {/* Password */}
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label className="d-flex justify-content-start">
            Password
          </Form.Label>
          <Form.Control
            type={mostraSenha ? "text" : "password"}
            onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => {
              if (e.key === "Enter") {
                 validationLogin(user, pass); // chama sua função
                }
              }}
            placeholder="Password"
          />
          <Form.Label
            className="d-flex justify-content-start text-danger fs-7 fw-bold"
            hidden={msgErro === ""}
            >
            {msgErro}
          </Form.Label>
        </Form.Group>

        {/* Mostrar senha */}
        <Form.Group
          className="p-2 d-flex justify-content-between"
          controlId="formBasicCheckbox"
        >
          <Form.Check
            onClick={() => setMostraSenha(!mostraSenha)}
            type="checkbox"
            label="Show password"
            />
        </Form.Group>

        {/* Botão */}
        <Form.Group>
          <Button
            className="w-100"
            onClick={() => validationLogin(user, pass)}
            variant="primary"
            type="button"
          >
            Connect
          </Button>
        </Form.Group>
      </Form>
    </div>
</div>
  );
}

// ---------------------------
// VIEW
// ---------------------------
function View({ setTela }: LoginProps) {
  const [dashboard, setDashboard] = useState<DashboardFinanceiro | null>(null);
  const [dataIni, setDataIni] = useState(
    format(new Date().setDate(1), "yyyy-MM-dd")
  );
  const [dataFim, setDataFim] = useState(
    format(subDays(addMonths(new Date().setUTCDate(1), 1), 1), "yyyy-MM-dd")
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [category, setCategory] = useState("Todos");

 const [show, setShow] = useState(false);
 const [titulo,setTitulo] = useState('');
 const [descricao,setDescricao] = useState('');
 const [valorIntegral,setIntegral] = useState('');
 const [valor,setValor] = useState('');
 const [parcela,setParcela] = useState('');

 const reqPost = (rota:string,obj:object) => {
  axios
      .post(`http://100.96.1.2:3000/${rota}`, obj, {
          headers: { Authorization: `Bearer ${userToken.token}` },
        })
      .then((response) => {
        if (response.status === 200) {
          return true;
        }
      })
      .catch((error) => {    
        alert(error);
        return false;
      });
 }

 const validaCadastro = () => {
if(titulo !== ''){
    alert('Titulo Ok')
  }
  else{
    return
  }
  if(categoryModal.startsWith('C')){
    alert('Credito')
    if(valorIntegral !== '' || valor !== ''){
      if(parcela !== '')
      {
      }
      else{
        return
      }
    }
    else{
      return
    }
  }
  else{
    if(!validator.isEmpty(valorIntegral)){
      if(categoryModal.startsWith('D')){
        alert(valorIntegral)
     let debito: Debito = {
        id: 0, // ou vem do backend
        titulo: titulo,
        descricao: '',
        valor: Number(valorIntegral), // garante número
        dthrReg: `${dataIniModal}T00:00:00.000Z`,
        status: 'N',
        userId:'0'
        };
      reqPost('debito/cadastro',debito)
      }else{

      }
      handleClose()
    }
  }
 };
  //Modal
const handleClose = () => setShow(false);
const handleShow = () => {  setShow(prev => true); // prev não é usado, só retorna true
  setDataIniModal(format(new Date(), 'yyyy-MM-dd'));
};
const [dataIniModal, setDataIniModal] = useState(format(new Date(), "yyyy-MM-dd"));
const [categoryModal, setCategoryModal] = useState("Todos");

  const handleClick = async () => {
    try {

      const response = await axios.get<DashboardFinanceiro>(
        `http://100.96.1.2:3000/geral/retorno?PageNumber=1&PageSize=9999&DataIni=${
          dataIni.split("-")[1]
        }%2F${dataIni.split("-")[2]}%2F${dataIni.split("-")[0]}&DataFim=${
          dataFim.split("-")[1]
        }%2F${dataFim.split("-")[2]}%2F${dataFim.split("-")[0]}${
          search !== "" ? `&titulo=${search}` : ""
        }${category !== "Todos" ? `&categoria=${category.substring(0, 1)}` : ""}${
          status !== "Todos"
            ? `&status=${status === "Pagos" ? "S" : "N"}`
            : ""
        }`,
        {
          headers: { Authorization: `Bearer ${userToken.token}` },
        }
      );
      setDashboard(response.data);
    } catch (error: any) {
      console.error("Erro na requisição:", error);
    }
  };


  return (
 <>
 {/*Modal*/}   
     <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Cadastros</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <div className="gap-2 p-2 d-flex">
       {/* Coluna Esquerda */}
       <div className="p-2 w-50 d-flex flex-column gap-2">
        <Form.Label className="d-flex flex-row">Título</Form.Label>
        <Form.Control type="text" placeholder="Titulo"  onChange={(e) => setTitulo(e.target.value)} />
        <Form.Label className="d-flex flex-row">Descrição</Form.Label>
        <textarea
          className="border"
          style={{
            maxHeight: "100px",
            minHeight: "37.6px",
            height: "37.6px",
          }}
          placeholder="Descrição"
        />
        <Form.Group>
          <Form.Label className="d-flex flex-row">Categoria</Form.Label>
          <Form.Select defaultValue="Todos" onChange={(e) => setCategoryModal(e.target.value)}>
            <option>Saldo</option>
            <option>Débito</option>
            <option>Crédito</option>
          </Form.Select>
        </Form.Group>
        <Form.Label className="d-flex flex-row mb-3">Data Inicial</Form.Label>
        <Form.Control
          type="date"
          value={dataIniModal}
          onChange={(e) =>
            setDataIniModal(format(parseISO(e.target.value), "yyyy-MM-dd"))
          }
        />
       </div>
       {/*Fim Modal*/}

       {/* Coluna Direita */}
       <div className="p-2 w-50 d-flex flex-column gap-2">
        <Form.Label className="d-flex flex-row">Valor integral</Form.Label>
        <Form.Control type="number" placeholder="R$00,00"  onChange={(e) => setIntegral(e.target.value)} />
        {category.substring(0,1) === 'C' && (
          <>
          <Form.Label className="d-flex flex-row">Valor Parcela</Form.Label>
          <Form.Control type="number" placeholder="R$00,00" onChange={(e) => setValor(e.target.value)} />
          <Form.Label className="d-flex flex-row">Parcela</Form.Label>
          <Form.Control type="number" placeholder="1" onChange={(e) => setParcela(e.target.value)} />
          </>
        )}

       </div>
       </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
          <Button variant="primary" onClick={() => validaCadastro()}>
            Cadastrar
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Botão Cadastrar */}
      <div className="m-3 d-flex justify-content-end">
      <Button onClick={handleShow}>Cadastrar</Button>
      </div>

      {/* Filtros */}
      <Form className="mb-3">
        <Row className="mb-3">
          <Col md={6} >
            <Form.Group>
              <Form.Label>Categoria</Form.Label>
              <Form.Select
                defaultValue="Todos"
                onChange={(e) => setCategory(e.target.value)}>
                <option>Todos</option>
                <option>Saldo</option>
                <option>Débito</option>
                <option>Crédito</option>
              </Form.Select>
            </Form.Group>
            </Col>
           <Col md={6} >
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                defaultValue="Todos"
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Todos</option>
                <option>Pagos</option>
                <option>Pendente</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Titulo"
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

          <Row className="mb-3 mt-1 d-flex justify-content-center align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Data Inicial</Form.Label>
              <Form.Control
                type="date"
                value={dataIni}
                onChange={(e) =>
                  setDataIni(format(parseISO(e.target.value), "yyyy-MM-dd"))
                }
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Data Final</Form.Label>
              <Form.Control
                type="date"
                value={dataFim}
                onChange={(e) =>
                  setDataFim(format(parseISO(e.target.value), "yyyy-MM-dd"))
                }
              />
            </Form.Group>
          </Col>
            <Col  md={3} align-items-end>
            <Form.Group >
                 <Button className="me-2"
  onClick={() => {
const partes = dataIni.split("-").map(Number);
let dtIni = new Date(partes[0], partes[1] - 1, 1); // primeiro dia do mês atual
dtIni.setMonth(dtIni.getMonth() - 1);               // vai para mês anterior

// dtFim = último dia do mesmo mês
let dtFim = new Date(dtIni);
dtFim.setMonth(dtFim.getMonth() + 1); // próximo mês
dtFim.setDate(0);                     // último dia do mês atual

setDataIni(format(dtIni, "yyyy-MM-dd"));
setDataFim(format(dtFim, "yyyy-MM-dd"));
  }}
>
  &lt;
</Button>
           <Button
  onClick={() => {
    const partes = dataIni.split("-").map(Number);
    let dtIni = new Date(partes[0], partes[1] - 1, partes[2]); // ano, mês (0-index), dia

    // Avança início para o próximo mês, dia 1
    dtIni.setMonth(dtIni.getMonth() + 1);
    dtIni.setDate(1);

    // Calcula fim: último dia do mês
    let dtFim = new Date(dtIni);
    dtFim.setMonth(dtFim.getMonth() + 1);
    dtFim.setDate(0);

    // Atualiza estados
    setDataIni(format(dtIni, "yyyy-MM-dd"));
    setDataFim(format(dtFim, "yyyy-MM-dd"));
  }}
>
 &gt;
</Button>

            </Form.Group>
          </Col>
        </Row>

        <Button onClick={handleClick}>Filtrar</Button>
      </Form>

      {/* Resumo */}
     <div className="mb-3">
  {dashboard?.financasGeral.map((valores) => (
    <div key={`${valores.divida}-${valores.saldo}`} className="mb-2">
      <Form.Label>Divida: R${valores.divida}</Form.Label>
      <Form.Label className="ms-3">Saldo: R${valores.saldo}</Form.Label>
    </div>
  ))}
  <div>
    <Form.Label>R${dashboard?.valores.at(-1)?.valor}</Form.Label>
  </div>
</div>

{/* Tabela */}
<div className="table-responsive" style={{ maxHeight: "400px" }}>
  <Table striped bordered hover>
    <thead>
      <tr>
        <th>Titulo</th>
        <th>Descrição</th>
        <th>Data</th>
        <th>Valor</th>
        <th>Parcela</th>
        <th>Categoria</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {dashboard?.gastosDetalhados.map((gasto, index) => (
        <tr
          key={gasto.id}
          className={gasto.status === "N" ? "table-warning" : "table-success"}
        >
          <td className="text-wrap">{gasto.titulo}</td>
          <td>{gasto.descricao}</td>
          <td>{`${gasto.dthr.split('-')[2].split('T')[0]}/${gasto.dthr.split('-')[1]}/${gasto.dthr.split('-')[0]}`}</td>
          <td>R${gasto.valor}</td>
          <td>{gasto.parcela === '0' ? '' : gasto.parcela}</td>
          <td>{gasto.categoria}</td>
          <td>{gasto.status}</td>
        </tr>
      ))}
    </tbody>
  </Table>
</div>
    </>
  );
}


export default App;
