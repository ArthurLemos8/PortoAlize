import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Table, Space, message } from "antd";
import { db } from "../../firebaseConfig";
import { collection, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import {
  subCategorySchema,
  type SubCategoryFormData,
} from "./SubCategoryPageValidations";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useFirestoreQuery } from "../../hook/useFirestoreQuery";

interface SubCategoryItem extends SubCategoryFormData {
  id: string;
}

export const SubCategoryPage = () => {
  const {
    data: subCategoryList,
    loading,
    refetch,
  } = useFirestoreQuery<SubCategoryItem>("subcategorias");

  const [idBeingEdited, setIdBeingEdit] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
  });

  const onSubmit = async (data: SubCategoryFormData) => {
    try {
      if (idBeingEdited) {
        const docRef = doc(db, "subcategorias", idBeingEdited);
        await setDoc(docRef, data);
        setIdBeingEdit(null);
        message.success("Subcategoria atualizada com sucesso!");
      } else {
        const colecaoRef = collection(db, "subcategorias");
        await addDoc(colecaoRef, data);
        message.success("Subcategoria cadastrada com sucesso!");
      }
      reset();
      await refetch();
    } catch {
      message.error("Erro ao salvar os dados.");
    }
  };

  const removeSubCategory = async (id: string) => {
    try {
      const docRef = doc(db, "subcategorias", id);
      await deleteDoc(docRef);
      message.success("Subcategoria removida!");
      await refetch();
    } catch {
      message.error("Erro ao remover.");
    }
  };

  const editSubCategory = (item: SubCategoryItem) => {
    setIdBeingEdit(item.id);
    reset(item);
  };

  const columns = [
    {
      title: "Nome da Subcategoria",
      dataIndex: "nome",
      key: "nome",
    },
    {
      title: "Ações",
      key: "actions",
      render: (item: SubCategoryItem) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              editSubCategory(item);
            }}
          ></Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeSubCategory(item.id)}
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "100%" }}>
      <h2>
        {idBeingEdited ? "Editar Subcategoria" : "Cadastrar Nova Subcategoria"}
      </h2>

      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={{ marginBottom: "32px" }}
      >
        <Form.Item
          label="Nome da Subcategoria"
          validateStatus={errors.nome ? "error" : ""}
          help={errors.nome?.message}
        >
          <Controller
            name="nome"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          {idBeingEdited ? "Atualizar Subcategoria" : "Cadastrar Subcategoria"}
        </Button>
        {idBeingEdited && (
          <Button
            type="default"
            onClick={() => {
              setIdBeingEdit(null);
              reset();
            }}
            style={{ marginLeft: "8px" }}
          >
            Cancelar
          </Button>
        )}
      </Form>
      <h3>Lista de Subcategorias</h3>
      <Table
        dataSource={subCategoryList || []}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};
