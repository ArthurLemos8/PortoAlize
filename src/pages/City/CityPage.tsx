import { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Table, Space, message } from 'antd';
import { db } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { cidadeSchema, type CidadeFormData } from './cityPageValidations';
import { DeleteOutlined,  } from "@ant-design/icons";

interface CidadeItem extends CidadeFormData {
  id: string;
}

export const CityPage = () => {
  const [cityList, setCityList] = useState<CidadeItem[]>([]);
  const [idBeingEdited, setIdBeingEdit] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CidadeFormData>({
    resolver: zodResolver(cidadeSchema),
  });

  useEffect(() => {
    async function donloadCity() {
      try {
        const colecaoRef = collection(db, "cidades");
        const querySnapshot = await getDocs(colecaoRef);
        const dados: CidadeItem[] = [];
        
        querySnapshot.forEach((doc) => {
          dados.push({ id: doc.id, ...(doc.data() as CidadeFormData) });
        });
        setCityList(dados);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      }
    }
    donloadCity();
  }, []);

  const onSubmit = async (data: CidadeFormData) => {
    try {
      if (idBeingEdited) {
        const docRef = doc(db, "cidades", idBeingEdited);
        await setDoc(docRef, data);
        
        setCityList((previous) =>
          previous.map((item) => (item.id === idBeingEdited ? { id: idBeingEdited, ...data } : item))
        );
        setIdBeingEdit(null);
        message.success("Cidade atualizada com sucesso!");
      } else {
        const colecaoRef = collection(db, "cidades");
        const docRef = await addDoc(colecaoRef, data);
        
        setCityList((previous) => [...previous, { id: docRef.id, ...data }]);
        message.success("Cidade cadastrada com sucesso!");
      }
      reset();
    } catch (error) {
      message.error("Erro ao salvar os dados.");
      console.error(error);
    }
  };

  const removeCity = async (id: string) => {
    try {
      const docRef = doc(db, "cidades", id);
      await deleteDoc(docRef);
      setCityList((previous) => previous.filter((item) => item.id !== id));
      message.success("Cidade removida!");
    } catch  {
      message.error("Erro ao remover.");
    }
  };

  const columns = [
    { title: 'Cidade', dataIndex: 'nome', key: 'nome' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado' },
    {
      title: 'Ações',
      key: 'acoes',
      render: (item: CidadeItem) => (
        <Space>
          <Button type="text" danger icon={<DeleteOutlined />}  onClick={() => removeCity(item.id)}></Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '100%' }}>
      <h2>{idBeingEdited ? "Editar Cidade" : "Cadastrar Nova Cidade"}</h2>
      
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ marginBottom: '32px' }}>
        <Form.Item label="Nome da Cidade" validateStatus={errors.nome ? "error" : ""} help={errors.nome?.message}>
          <Controller name="nome" control={control} render={({ field }) => <Input {...field} placeholder="Ex: Porto Alegre" />} />
        </Form.Item>

        <Form.Item label="Estado (UF)" validateStatus={errors.estado ? "error" : ""} help={errors.estado?.message}>
          <Controller name="estado" control={control} render={({ field }) => <Input {...field} placeholder="Ex: RS" maxLength={2} style={{ width: '100px' }} />} />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          {idBeingEdited ? "Salvar Alterações" : "Cadastrar"}
        </Button>
        
        {idBeingEdited && (
          <Button style={{ marginLeft: '8px' }} onClick={() => { setIdBeingEdit(null); reset(); }}>
            Cancelar
          </Button>
        )}
      </Form>
      <h3>Cidades Cadastradas</h3>
      <Table columns={columns} dataSource={cityList
  
      } rowKey="id" />
    </div>
  );

};