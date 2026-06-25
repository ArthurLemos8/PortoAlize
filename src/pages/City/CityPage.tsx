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
  const [listaCidades, setListaCidades] = useState<CidadeItem[]>([]);
  const [idSendoEditado, setIdSendoEditado] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CidadeFormData>({
    resolver: zodResolver(cidadeSchema),
  });

  useEffect(() => {
    async function carregarCidades() {
      try {
        const colecaoRef = collection(db, "cidades");
        const querySnapshot = await getDocs(colecaoRef);
        const dados: CidadeItem[] = [];
        
        querySnapshot.forEach((doc) => {
          dados.push({ id: doc.id, ...(doc.data() as CidadeFormData) });
        });
        setListaCidades(dados);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      }
    }
    carregarCidades();
  }, []);

  const onSubmit = async (data: CidadeFormData) => {
    try {
      if (idSendoEditado) {
        const docRef = doc(db, "cidades", idSendoEditado);
        await setDoc(docRef, data);
        
        setListaCidades((anterior) =>
          anterior.map((item) => (item.id === idSendoEditado ? { id: idSendoEditado, ...data } : item))
        );
        setIdSendoEditado(null);
        message.success("Cidade atualizada com sucesso!");
      } else {
        const colecaoRef = collection(db, "cidades");
        const docRef = await addDoc(colecaoRef, data);
        
        setListaCidades((anterior) => [...anterior, { id: docRef.id, ...data }]);
        message.success("Cidade cadastrada com sucesso!");
      }
      reset();
    } catch (error) {
      message.error("Erro ao salvar os dados.");
      console.error(error);
    }
  };

  const removerCidade = async (id: string) => {
    try {
      const docRef = doc(db, "cidades", id);
      await deleteDoc(docRef);
      setListaCidades((anterior) => anterior.filter((item) => item.id !== id));
      message.success("Cidade removida!");
    } catch (error) {
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
          <Button type="text" danger icon={<DeleteOutlined />}  onClick={() => removerCidade(item.id)}></Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '100%' }}>
      <h2>{idSendoEditado ? "Editar Cidade" : "Cadastrar Nova Cidade"}</h2>
      
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ marginBottom: '32px' }}>
        <Form.Item label="Nome da Cidade" validateStatus={errors.nome ? "error" : ""} help={errors.nome?.message}>
          <Controller name="nome" control={control} render={({ field }) => <Input {...field} placeholder="Ex: Porto Alegre" />} />
        </Form.Item>

        <Form.Item label="Estado (UF)" validateStatus={errors.estado ? "error" : ""} help={errors.estado?.message}>
          <Controller name="estado" control={control} render={({ field }) => <Input {...field} placeholder="Ex: RS" maxLength={2} style={{ width: '100px' }} />} />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          {idSendoEditado ? "Salvar Alterações" : "Cadastrar"}
        </Button>
        
        {idSendoEditado && (
          <Button style={{ marginLeft: '8px' }} onClick={() => { setIdSendoEditado(null); reset(); }}>
            Cancelar
          </Button>
        )}
      </Form>
      <h3>Cidades Cadastradas</h3>
      <Table columns={columns} dataSource={listaCidades} rowKey="id" />
    </div>
  );

};