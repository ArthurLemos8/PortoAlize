import {useState, useEffect} from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Table, Space, message } from 'antd';
import { db } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc} from 'firebase/firestore';
import { categorySchema, type CategoryFormData } from './CategoryPageValidations';
import { DeleteOutlined, EditOutlined  } from "@ant-design/icons";

interface categoryItem extends CategoryFormData {
    id: string;
};

export const CategoryPage = () => {
    
    const [categoryList, setCategoryList] = useState<categoryItem[]>([]);
    const [idBeingEdited, setIdBeingEdit] = useState<string | null>(null);
    const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
    });

    useEffect(() => {
        async function downloadCategory() {
            try {
                const colecaoRef = collection(db, "categorias");
                const querySnapshot = await getDocs(colecaoRef);
                const dados: categoryItem[] = [];
                
                querySnapshot.forEach((doc) => {
                    dados.push({ id: doc.id, ...(doc.data() as CategoryFormData) });
                });
                setCategoryList(dados);
            } catch {
                console.error("Erro ao buscar categorias:");
            }
        }
        downloadCategory();
    }, []);


    const onSubmit = async (data: CategoryFormData) => {
      try{
        if (idBeingEdited) {
          const docRef = doc(db, "categorias", idBeingEdited);
          await setDoc(docRef, data);
          
          setCategoryList((previous) =>
            previous.map((item) => (item.id === idBeingEdited ? { id: idBeingEdited, ...data } : item))
          );
          setIdBeingEdit(null);
          message.success("Categoria atualizada com sucesso!");
        } else {
          const colecaoRef = collection(db, "categorias");
          const docRef = await addDoc(colecaoRef, data);
          
          setCategoryList((previous) => [...previous, { id: docRef.id, ...data }]);
          message.success("Categoria cadastrada com sucesso!");
        }
        reset();    
      }catch {
        message.error("Erro ao salvar os dados.");
      }
    };

    const removeCategory = async (id: string) => {
      try {
        const docRef = doc(db, "categorias", id);
        await deleteDoc(docRef);
        setCategoryList((previous) => previous.filter((item) => item.id !== id));
        message.success("Categoria removida!");
      } catch  {
        message.error("Erro ao remover.");
      }
    };

    const editCategory = (item: categoryItem) => {
      setIdBeingEdit(item.id);
      reset(item);
    };

    const columns = [
        {
            title: 'Nome da Categoria',
            dataIndex: 'nome',
            key: 'nome',
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (item: categoryItem) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => { editCategory(item); }}></Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => removeCategory(item.id) }> </Button>
                </Space>
            ),
        },
    ];

    return (
       <div style={{ padding: '24px', maxWidth: '100%' }}>
         <h2>{idBeingEdited ? "Editar Categoria" : "Cadastrar Nova Categoria"}</h2>

         <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ marginBottom: '32px' }}>
            <Form.Item label="Nome da Categoria" validateStatus={errors.nome ? "error" : ""} help={errors.nome?.message}>
                <Controller name="nome" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
            <Button type="primary" htmlType="submit">{idBeingEdited ? "Atualizar Categoria" : "Cadastrar Categoria"}</Button>
            {idBeingEdited && (
                <Button type="default" onClick={() => { setIdBeingEdit(null); reset(); }} style={{ marginLeft: '8px' }}>Cancelar</Button>
            )}
         </Form>
         <h3>Lista de Categorias</h3>
         <Table dataSource={categoryList} columns={columns} rowKey="id" />
      </div>
    )
}