import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  Input,
  Table,
  notification,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Popconfirm,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { contentSchema, type ContentValues } from "./contentPageValidations";
import { db } from "../../firebaseConfig";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useFirestoreQuery } from "../../hook/useFirestoreQuery";

const { Title } = Typography;

interface RegisterItem extends ContentValues {
  id: string;
}

export const ContentPage = () => {
  const {
    data: registerList,
    loading,
    refetch,
  } = useFirestoreQuery<RegisterItem>("conteudos");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      autor: "",
      data: "",
      foto: "",
    },
  });

  const onSubmit = async (values: ContentValues) => {
    try {
      const colecaocRef = collection(db, "conteudos");
      await addDoc(colecaocRef, values);
      notification.success({
        message: "Sucesso",
        description: "Cadastro realizado com sucesso.",
      });
      reset();
      await refetch();
    } catch {
      notification.error({
        message: "Erro",
        description: "Erro ao realizar cadastro.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "conteudos", id));
      await refetch();
      notification.success({ message: "Registro removido com sucesso." });
    } catch {
      notification.error({ message: "Erro ao remover registro." });
    }
  };

  return (
    <div style={{ padding: "12px" }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Novo Cadastro
              </Title>
            }
            variant="borderless"
          >
            <Form layout="vertical" autoComplete="off">
              <Form.Item
                label="Nome"
                validateStatus={errors.nome ? "error" : ""}
                help={errors.nome?.message}
              >
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Digite o nome..." {...field} />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Descrição"
                validateStatus={errors.descricao ? "error" : ""}
                help={errors.descricao?.message}
              >
                <Controller
                  name="descricao"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      rows={4}
                      placeholder="Digite a descrição..."
                      {...field}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Autor"
                validateStatus={errors.autor ? "error" : ""}
                help={errors.autor?.message}
              >
                <Controller
                  name="autor"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Digite o autor..." {...field} />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Data"
                validateStatus={errors.data ? "error" : ""}
                help={errors.data?.message}
              >
                <Controller
                  name="data"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Ex: 15/09/2026" {...field} />
                  )}
                />
              </Form.Item>

              <Form.Item
                label="Foto"
                validateStatus={errors.foto ? "error" : ""}
                help={errors.foto?.message}
              >
                <Controller
                  name="foto"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="URL da imagem..." {...field} />
                  )}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space style={{ width: "100%", justifyContent: "end" }}>
                  <Button onClick={() => reset()}>Limpar</Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                  >
                    Salvar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Registros
              </Title>
            }
            variant="borderless"
          >
            <Table
              columns={[
                {
                  title: "Nome",
                  dataIndex: "nome",
                  key: "username",
                },
                {
                  title: "Descrição",
                  dataIndex: "descricao",
                  key: "description",
                },
                {
                  title: "Autor",
                  dataIndex: "autor",
                  key: "autor",
                },
                {
                  title: "Data",
                  dataIndex: "data",
                  key: "data",
                },
                {
                  title: "Ações",
                  key: "actions",
                  render: (_, record) => (
                    <Space>
                      <Popconfirm
                        title="Tem certeza que deseja remover este registro?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        ></Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
              dataSource={registerList ?? []}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
