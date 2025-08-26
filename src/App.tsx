/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import validator, { stripLow } from "validator";
import * as R from 'ramda';
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { addMonths, format,parseISO, subDays } from 'date-fns'
import { Form,Table, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

let userToken:webToke;
type webToke = {token:string,refreshToken:string,expiration:string,id:string}

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

// Tipo principal que agrupa todos
type DashboardFinanceiro = {
  financasGeral: FinancaGeral[];
  valores: ValorCategoria[];
  gastosDetalhados: GastoDetalhado[];
};

function App() {
  const [tela,setTela] = useState(1)
  const [mostraSenha,setMostraSenha] = useState(false);
  const [user,setUser] = useState('');
  const [pass,setPass] = useState('');
  const [msgErro,setMsgErro] = useState('')

  const validationLogin = (email:string, senha:string) => {
    if (!email || !senha) {
      setMsgErro("Preencha todos os campos")
      return false;
    }
    axios.post("http://100.96.1.2:3000/api/Auth/login",{userName: email,password: pass})
    .then(response => {
      if(response.status === 200){
        userToken = {
          token:response.data.token,
          expiration:response.data.expiration,
          id:response.data.id,
            refreshToken:response.data.refreshToken
          }
          setMsgErro('')
          setTela(2)
          return true
        }
        
      })
        .catch(error => {
           if(error.status === 401){
            setMsgErro("Usuário ou senha inválidos!")
          return false
        }
        setMsgErro("Ocorreu um erro!")
        return false;
      });
      return true;
    }
    return (
      <>
    {tela === 1 ? (
    <div className='border w-100 p-5 bg-light text-dark shadow-sm bg-body-tertiary rounded d-flex justify-content-center'>
  <Form style={{ width: '100%', maxWidth: '500px' }}>
    <Form.Group className="mb-3" controlId="formBasicEmail">
      <Form.Label className='d-flex justify-content-start'>Username</Form.Label>
      <Form.Control type="text" placeholder="Username" onChange={(e) => setUser(e.target.value)}/>
    </Form.Group>

    <Form.Group className="mb-3" controlId="formBasicPassword">
      <Form.Label className='d-flex justify-content-start'>Password</Form.Label>
      <Form.Control type={mostraSenha ? "text" : "password"} onChange={(e) => setPass(e.target.value)} placeholder="Password" />
      <Form.Label className='d-flex justify-content-start text-danger fs-7 fw-bold' visible={msgErro === "" ? false : true} >{msgErro !== ""? msgErro : ""}</Form.Label>
    </Form.Group>

    <Form.Group className="p-2 d-flex justify-content-between" controlId="formBasicCheckbox">
      <Form.Check onClick={() => setMostraSenha(!mostraSenha)} type="checkbox" label="Show password" />
    </Form.Group>
    <Form.Group>
        <Button className='w-100' onClick={() => validationLogin(user,pass)} variant="primary" type="button">Connect</Button>
    </Form.Group>
  </Form>
</div>
) : (<View /> )} </>
 );
}



function View() {
  const [dashboard, setDashboard] = useState<DashboardFinanceiro | null>(null);
  const [dataIni,setDataIni] = useState(format(new Date().setUTCDate(1),'yyyy-MM-dd'))
  const [dataFim,setDataFim] = useState(format(subDays(addMonths(new Date().setUTCDate(1),1),1),'yyyy-MM-dd'))
  const [search,setSearch] = useState('')
  const [status,setStatus] = useState('Todos')
  const [category,setCategory] = useState('Todos')

  const handleClick = async () => {
    try {
      console.log( `http://100.96.1.2:3000/geral/retorno?PageNumber=1&PageSize=9999&DataIni=
        ${dataIni.split('-')[1]}%2F${dataIni.split('-')[2]}%2F${dataIni.split('-')[0]}
        &DataFim=${dataFim.split('-')[1]}%2F${dataFim.split('-')[2]}%2F${dataFim.split('-')[0]}
        ${search !== '' ? `&titulo=${search}` : ''}
        ${category !== 'Todos' ? `&categoria=${category.substring(0,1)}`:''}
        ${status !== 'Todos' ? `&status=${status === 'Pagos' ? 'S' : 'N' }`:''}`)

      const response = await axios.get<DashboardFinanceiro>(
        `http://100.96.1.2:3000/geral/retorno?PageNumber=1&PageSize=9999&DataIni=${dataIni.split('-')[1]}%2F${dataIni.split('-')[2]}%2F${dataIni.split('-')[0]}&DataFim=${dataFim.split('-')[1]}%2F${dataFim.split('-')[2]}%2F${dataFim.split('-')[0]}${search !== '' ? `&titulo=${search}` : ''}${category !== 'Todos' ? `&categoria=${category.substring(0,1)}`:''}${status !== 'Todos' ? `&status=${status === 'Pagos' ? 'S' : 'N' }`:''}`,
        {
          headers: {
            Authorization: `Bearer ${userToken.token}`,
          },
        }
      );
      setDashboard(response.data); // salva os dados no state
    } catch (error: any) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <>
   <Form className="gap-2 mt-5">
  <Row className="mb-3">
    {/* Campo título */}
    <Col md={4}>
      <Form.Group>
        <Form.Label>Título</Form.Label>
        <Form.Control type="text" placeholder="Titulo" onChange={(e) => setSearch(e.target.value)}/>
      </Form.Group>
    </Col>

    {/* Categoria */}
    <Col md={4}>
      <Form.Group>
        <Form.Label>Categoria</Form.Label>
        <Form.Select defaultValue="Todos" onChange={(e) => setCategory(e.target.value)}>
          <option>Todos</option>
          <option>Saldo</option>
          <option>Débito</option>
          <option>Crédito</option>
        </Form.Select>
      </Form.Group>
    </Col>

    {/* Status */}
    <Col md={4}>
      <Form.Group>
        <Form.Label>Status</Form.Label>
        <Form.Select defaultValue="Todos" onChange={(e) => setStatus(e.target.value)}>
          <option>Todos</option>
          <option>Pagos</option>
          <option>Pendente</option>
        </Form.Select>
      </Form.Group>
    </Col>
  </Row>

  <Row className="mb-3">
    {/* Data Inicial */}
    <Col md={6}>
      <Form.Group>
        <Form.Label>Data Inicial</Form.Label>
        <Form.Control
          type="date"
          value={dataIni}
          onChange={(e) => setDataIni(format(parseISO(e.target.value), 'yyyy-MM-dd'))}
        />
      </Form.Group>
    </Col>

    {/* Data Final */}
    <Col md={6}>
      <Form.Group>
        <Form.Label>Data Final</Form.Label>
        <Form.Control
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(format(parseISO(e.target.value), 'yyyy-MM-dd'))}
        />
      </Form.Group>
    </Col>
  </Row>
</Form> 
{dashboard?.financasGeral.map((valores, index) => (
  <div key={index} className="mb-2">
    <Form.Label>Divida: R${valores.divida}</Form.Label>
    <Form.Label className="ms-3">Saldo: R${valores.saldo}</Form.Label>
  </div>
))}
<div><Form.Label>R${dashboard?.valores.at(-1)?.valor}</Form.Label></div>
    <Button onClick={handleClick}>Filtrar</Button>
    <div className="table-responsive mt-2"  style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Descrição</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Parcela</th>
            <th>Status</th>
          </tr>
        </thead>
       <tbody>
  {dashboard?.gastosDetalhados.map((gasto, index) => (
     <tr
       key={gasto.id ?? index} // se tiver id use id, senão índice
       className={gasto.status === 'N' ? 'table-warning' : 'table-success'}
     >
      <td className="text-wrap">{gasto.titulo}</td>
      <td>{gasto.descricao}</td>
      <td>{gasto.dthr}</td>
      <td>{gasto.valor}</td>
      <td>{gasto.parcela}</td>
      <td>{gasto.status}</td>
    </tr>
  ))}
</tbody>
      </Table>
    </div>
    </>
  );
}
export default App
