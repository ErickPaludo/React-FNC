/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import validator, { stripLow } from "validator";
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { addMonths, format } from 'date-fns'
import { Form,Table, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

let userToken:webToke;
type webToke = {token:string,refreshToken:string,expiration:string,id:string}
// Representa cada item de "financasGeral"
type FinancaGeral = {
  divida: number;
  saldo: number;
};

// Representa cada item de "valores"
type ValorCategoria = {
  categoria: string;
  valor: number;
};

// Representa cada item de "gastosDetalhados"
type GastoDetalhado = {
  id: number;
  gpId: number;
  titulo: string;
  descricao: string;
  valor: number;
  dthr: string; // ou Date se converter depois
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

  const handleClick = async () => {
    try {
      const response = await axios.get<DashboardFinanceiro>(
        "http://100.96.1.2:3000/geral/retorno?PageNumber=1&PageSize=9999&DataIni=01%2F01%2F2000&DataFim=01%2F01%2F2100",
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
    <Form className="gap-2">
      <Row className="mb-3 gap-3">
        <Form.Group>
          <Form.Control type="text" placeholder="Titulo" />
        </Form.Group>
        <Row>
        <Form.Group as={Col}>
          <Form.Label className="p-2 d-flex justify-content-between">Category</Form.Label>
          <Form.Select defaultValue="Todos">
            <option>Todos</option>
            <option>Saldo</option>
            <option>Débito</option>
            <option>Crédito</option>
          </Form.Select>
        </Form.Group>
        <Form.Group as={Col}>
          <Form.Label className="p-2 d-flex justify-content-between">Status</Form.Label>
          <Form.Select defaultValue="Todos">
            <option>Todos</option>
            <option>Pagos</option>
            <option>Pendente</option>
          </Form.Select>
        </Form.Group>
        </Row>
        <Row>
          
        <Form.Group as={Col}>
          <Form.Control type="date" value={format(new Date(),'yyyy-MM-dd')} /> 
        </Form.Group>
        <Form.Group as={Col}>
        <Form.Control type="date" value={format(addMonths(new Date(),1),'yyyy-MM-dd')}/> 
        </Form.Group>
        </Row>
      </Row>
    </Form>
    <Button onClick={handleClick}>Filtrar</Button>
      <Table striped bordered hover className="mt-3 w-50">
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Parcela</th>
          </tr>
        </thead>
        <tbody>
          {dashboard?.gastosDetalhados.map((gasto) => (
             <tr> 
              <td className="text-wrap">{gasto.titulo}</td>
              <td>{gasto.dthr}</td>
              <td>{gasto.valor}</td>
              <td>{gasto.parcela}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
export default App
