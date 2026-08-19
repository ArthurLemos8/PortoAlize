import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  Input,
  Table,
  Space,
  Select,
  Switch,
  Row,
  Col,
  Card,
  message,
} from "antd";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import {
  estabelecimentoSchema,
  type EstabelecimentoFormData,
} from "./establishmentPageValidations";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { withMask } from "use-mask-input";

interface EstablishmentItem extends EstabelecimentoFormData {
  id: string;
}
interface OptionCity {
  id: string;
  nome: string;
  estado: string;
}

interface OptionCategory {
  id: string;
  nome: string;
}

const WeekDays = [
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
  "domingo",
] as const;
type Hours = Record<(typeof WeekDays)[number], { abre: string; fecha: string }>;

export const EstablishmentPage = () => {
  const [establishmentPage, setestablishmentPage] = useState<
    EstablishmentItem[]
  >([]);
  const [citys, setCity] = useState<OptionCity[]>([]);
  const [idBeingedit, setidBeingedit] = useState<string | null>(null);
  const [opensGeneral, setOpensgGeneral] = useState("");
  const [closeGeneral, setCloseGeneral] = useState("");
  const [categoryList, setCategoryList] = useState<OptionCategory[]>([]);

  const defaultValues: Partial<EstabelecimentoFormData> = {
    ativo: true,
    horario_funcionamento: WeekDays.reduce((acc, dia) => {
      acc[dia] = { abre: "08:00", fecha: "18:00" };
      return acc;
    }, {} as Hours),
  };
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EstabelecimentoFormData>({
    resolver: zodResolver(estabelecimentoSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: EstabelecimentoFormData) => {
    try {
      if (idBeingedit) {
        await setDoc(doc(db, "estabelecimentos", idBeingedit), data);
        setestablishmentPage((ant) =>
          ant.map((item) =>
            item.id === idBeingedit ? { id: idBeingedit, ...data } : item,
          ),
        );
        setidBeingedit(null);
        message.success("Estabelecimento atualizado!");
      } else {
        const docRef = await addDoc(collection(db, "estabelecimentos"), data);
        setestablishmentPage((ant) => [...ant, { id: docRef.id, ...data }]);
        message.success("Estabelecimento cadastrado!");
      }
      reset(defaultValues);
    } catch {
      message.error("Erro ao salvar.");
    }
  };

  useEffect(() => {
    async function loadingDados() {
      try {
        const cidadesSnapshot = await getDocs(collection(db, "cidades"));
        const listaCids: OptionCity[] = [];
        cidadesSnapshot.forEach((doc) => {
          listaCids.push({
            id: doc.id,
            nome: doc.data().nome,
            estado: doc.data().estado,
          });
        });
        setCity(listaCids);

        const estSnapshot = await getDocs(collection(db, "estabelecimentos"));
        const listaEsts: EstablishmentItem[] = [];
        estSnapshot.forEach((doc) => {
          listaEsts.push({
            id: doc.id,
            ...(doc.data() as EstabelecimentoFormData),
          });
        });
        setestablishmentPage(listaEsts);
      } catch {
        message.error("Erro ao carregar dados do Firebase");
      }
    }
    loadingDados();

    async function loadCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        const dados: OptionCategory[] = [];
        querySnapshot.forEach((doc) => {
          dados.push({ id: doc.id, nome: doc.data().nome });
        });
        setCategoryList(dados);
      } catch (error) {
        console.error("Erro ao buscar categorias para o select:", error);
      }
    }
    loadCategories();
  }, []);

  const removeEstablishment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "estabelecimentos", id));
      setestablishmentPage((ant) => ant.filter((item) => item.id !== id));
      message.success("Removido com sucesso!");
    } catch {
      message.error("Erro ao remover.");
    }
  };

  const editEstablishment = (item: EstablishmentItem) => {
    setidBeingedit(item.id);
    reset(item);
  };

  const columns = [
    { title: "Nome", dataIndex: "nome", key: "nome" },
    {
      title: "Categoria",
      dataIndex: "categoria",
      key: "categoria",
      render: (categoriaId: string) => {
        const categoria = categoryList.find((cat) => cat.id === categoriaId);
        return categoria ? categoria.nome : categoriaId;
      },
    },
    {
      title: "Cidade",
      dataIndex: "cidade",
      key: "cidade",
      render: (cidadeId: string) => {
        const cid = citys.find((c) => c.id === cidadeId);
        return cid ? `${cid.nome} - ${cid.estado}` : "Cidade não encontrada";
      },
    },
    {
      title: "Status",
      dataIndex: "ativo",
      key: "ativo",
      render: (ativo: boolean) => (ativo ? "Ativo" : "Inativo"),
    },
    {
      title: "Ações",
      key: "acoes",
      render: (item: EstablishmentItem) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => editEstablishment(item)}
          ></Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeEstablishment(item.id)}
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2>
        {idBeingedit ? "Editar Estabelecimento" : "Cadastrar Estabelecimento"}
      </h2>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item
              label="Nome"
              validateStatus={errors.nome ? "error" : ""}
              help={errors.nome?.message}
            >
              <Controller
                name="nome"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Cidade"
              validateStatus={errors.cidade ? "error" : ""}
              help={errors.cidade?.message}
            >
              <Controller
                name="cidade"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="Selecione uma cidade">
                    {citys.map((cid) => (
                      <Select.Option key={cid.id} value={cid.id}>
                        {cid.nome} - {cid.estado}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ativo">
              <Controller
                name="ativo"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onChange={onChange} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Categoria"
              validateStatus={errors.categoria ? "error" : ""}
              help={errors.categoria?.message}
            >
              <Controller
                name="categoria"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="Selecione uma categoria">
                    {categoryList.map((cat) => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Telefone"
              validateStatus={errors.telefone ? "error" : ""}
              help={errors.telefone?.message}
            >
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    ref={withMask("(99) 99999-9999")}
                    placeholder="(99) 99999-9999"
                  />
                )}
              />{" "}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Endereço"
              validateStatus={errors.endereco ? "error" : ""}
              help={errors.endereco?.message}
            >
              <Controller
                name="endereco"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Descrição"
          validateStatus={errors.descricao ? "error" : ""}
          help={errors.descricao?.message}
        >
          <Controller
            name="descricao"
            control={control}
            render={({ field }) => <Input.TextArea {...field} rows={2} />}
          />
        </Form.Item>

        <Card
          title="Horários de Funcionamento"
          size="small"
          style={{ marginBottom: 24 }}
        >
          <Row
            gutter={16}
            style={{
              marginBottom: 20,
              paddingBottom: 15,
              borderBottom: "1px dashed #f0f0f0",
              alignItems: "flex-end",
            }}
          >
            <Col span={6}>
              <Form.Item
                label={
                  <strong style={{ color: "#1890ff" }}>Abre (Atalho)</strong>
                }
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Ex: 08:00"
                  value={opensGeneral}
                  onChange={(e) => setOpensgGeneral(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  <strong style={{ color: "#1890ff" }}>Fecha (Atalho)</strong>
                }
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Ex: 18:00"
                  value={closeGeneral}
                  onChange={(e) => setCloseGeneral(e.target.value)}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Button
                type="dashed"
                style={{ color: "#1890ff", borderColor: "#1890ff" }}
                onClick={() => {
                  if (!opensGeneral || !closeGeneral) {
                    message.warning(
                      "Preencha o Abre e Fecha Geral antes de aplicar!",
                    );
                    return;
                  }
                  WeekDays.forEach((dia) => {
                    setValue(
                      `horario_funcionamento.${dia}.abre`,
                      opensGeneral,
                      { shouldValidate: true },
                    );
                    setValue(
                      `horario_funcionamento.${dia}.fecha`,
                      closeGeneral,
                      { shouldValidate: true },
                    );
                  });

                  message.success("Horários aplicados para a semana toda!");
                }}
              >
                Aplicar a todos os dias
              </Button>
            </Col>
          </Row>

          {WeekDays.map((dia) => (
            <Row
              gutter={16}
              key={dia}
              style={{ marginBottom: 8, alignItems: "center" }}
            >
              <Col span={4}>
                <strong>{dia.toUpperCase()}:</strong>
              </Col>
              <Col span={4}>
                <Controller
                  name={`horario_funcionamento.${dia}.abre`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Abre (ex: 08:00)" />
                  )}
                />
              </Col>
              <Col span={4}>
                <Controller
                  name={`horario_funcionamento.${dia}.fecha`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Fecha (ex: 18:00)" />
                  )}
                />
              </Col>
            </Row>
          ))}
        </Card>

        <Button type="primary" htmlType="submit" style={{ marginBottom: 32 }}>
          {idBeingedit ? "Salvar Alterações" : "Cadastrar Estabelecimento"}
        </Button>
        {idBeingedit && (
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              setidBeingedit(null);
              reset(defaultValues);
            }}
          >
            Cancelar
          </Button>
        )}
      </Form>

      <h3>Estabelecimentos Cadastrados</h3>
      <Table columns={columns} dataSource={establishmentPage} rowKey="id" />
    </div>
  );
};
