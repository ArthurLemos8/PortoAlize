import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Table, Space, message, Select } from "antd";
import { db } from "../../firebaseConfig";
import { collection, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import {
  subCategorySchema,
  type SubCategoryFormData,
} from "./SubCategoryPageValidations";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useFirestoreQuery } from "../../hook/useFirestoreQuery";
import { icons } from "lucide-react";

interface SubCategoryItem extends SubCategoryFormData {
  id: string;
}

interface CategoryItem {
  id: string;
  nome: string;
  icon?: string;
}

export const SubCategoryPage = () => {
  const {
    data: subCategoryList,
    loading,
    refetch,
  } = useFirestoreQuery<SubCategoryItem>("subcategorias");
  const { data: categoryList } = useFirestoreQuery<CategoryItem>("categorias");

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
      title: "Categoria",
      dataIndex: "categoriaId",
      key: "categoriaId",
      render: (categoriaId: string) => {
        const categoria = (categoryList ?? []).find(
          (cat) => cat.id === categoriaId,
        );
        const iconName = categoria?.icon as keyof typeof icons;
        const IconComponent = icons[iconName];
        return categoria ? (
          <Space>
            {IconComponent && <IconComponent size={18} />}
            {categoria.nome}
          </Space>
        ) : (
          categoriaId
        );
      },
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
        <Form.Item
          label="Categoria Principal"
          validateStatus={errors.categoriaId ? "error" : ""}
          help={errors.categoriaId?.message}
        >
          <Controller
            name="categoriaId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Selecione uma categoria">
                {(categoryList ?? []).map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </Select.Option>
                ))}
              </Select>
            )}
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
