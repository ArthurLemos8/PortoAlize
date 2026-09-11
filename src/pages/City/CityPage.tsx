import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, InputNumber, Table, Space, message } from "antd";
import { db } from "../../firebaseConfig";
import { doc, deleteDoc, collection, addDoc, setDoc } from "firebase/firestore";
import { cidadeSchema, type CidadeFormData } from "./cityPageValidations";
import { DeleteOutlined } from "@ant-design/icons";
import { useFirestoreQuery } from "../../hook/useFirestoreQuery";

interface CidadeItem extends CidadeFormData {
  id: string;
}

export const CityPage = () => {
  const [idBeingEdited, setIdBeingEdit] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CidadeFormData>({
    resolver: zodResolver(cidadeSchema),
  });

  const {
    data: cityList,
    loading,
    refetch,
  } = useFirestoreQuery<CidadeItem>("cidades", [
    { type: "orderBy", field: "ordem", direction: "asc" },
  ]);

  const onSubmit = async (data: CidadeFormData) => {
    try {
      if (idBeingEdited) {
        const docRef = doc(db, "cidades", idBeingEdited);
        await setDoc(docRef, data);

        setIdBeingEdit(null);
        message.success("Cidade atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "cidades"), data);
        message.success("Cidade cadastrada com sucesso!");
      }
      reset();
    } catch (error) {
      message.error("Erro ao salvar os dados.");
      console.error(error);
    }
    await refetch();
  };

  const removeCity = async (id: string) => {
    try {
      const docRef = doc(db, "cidades", id);
      await deleteDoc(docRef);
      message.success("Cidade removida!");
    } catch {
      message.error("Erro ao remover.");
    }
    await refetch();
  };

  const columns = [
    { title: "Cidade", dataIndex: "nome", key: "nome" },
    { title: "Estado", dataIndex: "estado", key: "estado" },
    {
      title: "Ações",
      key: "acoes",
      render: (item: CidadeItem) => (
        <Space>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeCity(item.id)}
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "100%" }}>
      <h2>{idBeingEdited ? "Editar Cidade" : "Cadastrar Nova Cidade"}</h2>

      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={{ marginBottom: "32px" }}
      >
        <Form.Item
          label="Nome da Cidade"
          validateStatus={errors.nome ? "error" : ""}
          help={errors.nome?.message}
        >
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Ex: Porto Alegre" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Estado (UF)"
          validateStatus={errors.estado ? "error" : ""}
          help={errors.estado?.message}
        >
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Ex: RS"
                maxLength={2}
                style={{ width: "100px" }}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Ordem de exibição"
          validateStatus={errors.ordem ? "error" : ""}
          help={errors.ordem?.message}
        >
          <Controller
            name="ordem"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                precision={0}
                placeholder="Ex: 1"
                style={{ width: "100px" }}
                onChange={(val) => field.onChange(val)}
              />
            )}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          {idBeingEdited ? "Salvar Alterações" : "Cadastrar"}
        </Button>

        {idBeingEdited && (
          <Button
            style={{ marginLeft: "8px" }}
            onClick={() => {
              setIdBeingEdit(null);
              reset();
            }}
          >
            Cancelar
          </Button>
        )}
      </Form>
      <h3>Cidades Cadastradas</h3>
      <Table
        columns={columns}
        dataSource={cityList ?? []}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};
