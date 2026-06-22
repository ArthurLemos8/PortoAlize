import { useEffect, useState } from "react";
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
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

const { Title } = Typography;

interface CadastroItem extends ContentValues {
  id: string;
}

export const ContentPage = () => {
  const [listaCadastros, setListaCadastros] = useState<CadastroItem[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      username: "",
      description: "",
    },
  });

  const onSubmit = async (values: ContentValues) => {
    try {
      const colecaocRef = collection(db, "cadastro");
      await addDoc(colecaocRef, values);
      notification.success({
        message: "Sucesso",
        description: "Cadastro realizado com sucesso.",
      });
      reset();
    } catch (error) {
      notification.error({
        message: "Erro",
        description: "Erro ao realizar cadastro.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "cadastro", id));
      notification.success({ message: "Registro removido com sucesso." });
    } catch (error) {
      notification.error({ message: "Erro ao remover registro." });
    }
  };

  useEffect(() => {
    const colecaocRef = collection(db, "cadastro");

    const unsubscribe = onSnapshot(
      colecaocRef,
      (snapshot) => {
        const dados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CadastroItem[];

        setListaCadastros(dados);
        setLoadingTable(false);
      },
      (error) => {
        console.error(error);
        notification.error({ message: "Erro ao carregar dados da tabela." });
        setLoadingTable(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "12px" }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
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
                validateStatus={errors.username ? "error" : ""}
                help={errors.username?.message}
              >
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Digite o nome..." {...field} />
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
                      rows={4}
                      placeholder="Digite a descrição..."
                      {...field}
                    />
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

        <Col xs={24} lg={16}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Registros Cadastrados
              </Title>
            }
            variant="borderless"
          >
            <Table
              columns={[
                {
                  title: "Nome",
                  dataIndex: "username",
                  key: "username",
                  width: "30%",
                },
                {
                  title: "Descrição",
                  dataIndex: "description",
                  key: "description",
                  width: "55%",
                },
                {
                  title: "Ações",
                  key: "actions",
                  width: "15%",
                  render: (_: any, record: CadastroItem) => (
                    <Popconfirm
                      title="Tem certeza que deseja excluir?"
                      onConfirm={() => handleDelete(record.id)}
                      okText="Sim"
                      cancelText="Não"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ),
                },
              ]}
              dataSource={listaCadastros}
              rowKey="id"
              loading={loadingTable}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
