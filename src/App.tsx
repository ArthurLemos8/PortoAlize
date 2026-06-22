
import { db } from './firebaseConfig'; 
import { doc, addDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import './App.css'

import React, {  useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Form, Input, Menu, Table, Space } from 'antd';



const items = [
  { key: '1', label: 'Opção 1' },
  { key: '2', label: 'Opção 2' },
  { key: '3', label: 'Opção 3' },
  {
    key: 'sub1',
    label: 'Navegação',
    children: [
      { key: '4', label: 'Opção 4' },
      { key: '5', label: 'Opção 4' },
    ],
  },

];

const cadastroSchema = z.object({
  username: z.string().min(5, "Nome deve conter no minimo 5 caracteres"),
  description: z.string().min(10, "Descrição deve conter no minimo 10 caracteres"),
});

type cadastroFormData = z.infer<typeof cadastroSchema>;



const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  interface CadastroItem extends cadastroFormData{
    id: string;
  }
  const [listaCadastros, setlistaCadastros] = useState<CadastroItem[]>([]);

  React.useEffect(()=>{
    async function carregarDadosFire(){
      try{
        const colecaoRef = collection(db, "cadastro");
       const querySnapshot = await getDocs(colecaoRef);

        const dadosCarregados: CadastroItem[] = [];
        querySnapshot.forEach((doc)=>{
          dadosCarregados.push({
            id: doc.id,
            ...(doc.data() as cadastroFormData)
          });
        });
        setlistaCadastros(dadosCarregados);
      }catch(error){
        console.error("Erro ao carregar os dados", error);
      }
    }
    carregarDadosFire();
  }, []);
  
  const columns = [
    {
      title: 'Nome',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (item: CadastroItem) => (
        <Space>
          <Button type="link" onClick={() => editarCadastro(item)}>Editar</Button>
          <Button danger type="link" onClick={()=> removerCadastro(item.id)}>
            Remover
          </Button>
        </Space>
      ),
    },
  ];

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<cadastroFormData>({
    resolver: zodResolver(cadastroSchema),
  });

  const onSubmit = async (data: cadastroFormData) => {
   const novoId = await salvarDados(data);
   if(novoId){
    const novoItem: CadastroItem ={
      id: novoId,
      ...data
    };
    setlistaCadastros((listaAnterior) => [...listaAnterior, novoItem]);
    reset();
   }
  }

  return (
    <div className="layout">

      <div className="menu-lateral" style={{ width: collapsed ? 80 : 256, transition: 'width 0.2s' }}>

        <Button type="primary" onClick={() => setCollapsed(!collapsed)} style={{ marginBottom: 16 }}>
          {collapsed ? 'Abrir' : 'Fechar'}
        </Button>
        <Menu
          defaultSelectedKeys={['1']}
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={items}
        />
      </div>
      <div className="Container">
        <Form
          name="cadastro"
          layout='horizontal'
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          style={{ maxWidth: 600, width: '100%' }}
          autoComplete="off"
        >
          <Form.Item
            label="Nome"
            validateStatus={errors.username ? "error" : ""}
            help={errors.username?.message}
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input {...field} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Descrição"
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  rows={8}
                  {...field}
                />
              )}
            />
          </Form.Item>

          <Form.Item label={null}>
            <Button
              type="primary"
              onClick={handleSubmit(onSubmit)}
            >
              Enviar
            </Button>
          </Form.Item>
        </Form>
            
       <Table
          columns={columns}
          dataSource={listaCadastros}
          rowKey="id"/>
      </div>
    </div>
  );

 async  function removerCadastro(id: string){
    try{
      const docRef = doc(db, "cadastro", id);
      await deleteDoc(docRef);
      setlistaCadastros((listAnterior)=>listAnterior.filter(item=>item.id !== id));
      console.log("Removido do FireStore");
    }catch(error){
      console.log("Erro ao remover do FireStore");
    }
  }

  function editarCadastro(item: CadastroItem){
    setValue("username", item.username);
    setValue("description", item.description);
  }

};
async function salvarDados(cadastro: cadastroFormData): Promise<string|null> {
  try{
    const colecaocRef = collection(db, "cadastro");
    const docRef=await addDoc(colecaocRef, cadastro);
    console.log("Novo cadastro salvo com ID:", docRef.id);
    return docRef.id;
  }catch(error){
    console.error("Erro ao salvar no FireStore", error);
    return null;
  }

}



export default App;

