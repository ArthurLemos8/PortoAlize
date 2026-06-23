import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Table, Space, Select, Switch, Row, Col, Card, message } from 'antd';
import { db } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { estabelecimentoSchema, type EstabelecimentoFormData } from './establishmentPageValidations';

interface EstabelecimentoItem extends EstabelecimentoFormData {
  id: string;
}
interface OptionCity{
  id: string;
  nome: string;
  estado: string;
}
const WeekDays = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'] as const;

export const EstabelecimentosPage: React.FC = () => {
  const [listaEstabelecimentos, setListaEstabelecimentos] = useState<EstabelecimentoItem[]>([]);
  const [cidades, setCidades] = useState<OptionCity[]>([]);
  const [idSendoEditado, setIdSendoEditado] = useState<string | null>(null);

  const valoresPadrao: Partial<EstabelecimentoFormData> = {
    ativo: true,
    horario_funcionamento: WeekDays.reduce((acc, dia) => {
      acc[dia] = { abre: '08:00', fecha: '18:00' };
      return acc;
    }, {} as unknown),
  };
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<EstabelecimentoFormData>({
    resolver: zodResolver(estabelecimentoSchema),
    defaultValues: valoresPadrao,
  });

  useEffect(() => {
    async function loadingDados() {
      try {

        const cidadesSnapshot = await getDocs(collection(db, "cidades"));
        const listaCids: OptionCity[] = [];
        cidadesSnapshot.forEach(doc => {
          listaCids.push({ id: doc.id, ...doc.data() as any });
        });
        setCidades(listaCids);

        const estSnapshot = await getDocs(collection(db, "estabelecimentos"));
        const listaEsts: EstabelecimentoItem[] = [];
        estSnapshot.forEach(doc => {
          listaEsts.push({ id: doc.id, ...doc.data() as EstabelecimentoFormData });
        });
        setListaEstabelecimentos(listaEsts);
      } catch (error) {
        message.error("Erro ao carregar dados do Firebase");
      }
    }
    loadingDados();
  }, []);

  const onSubmit = async (data: EstabelecimentoFormData) => {
    try {
      if (idSendoEditado) {
        await setDoc(doc(db, "estabelecimentos", idSendoEditado), data);
        setListaEstabelecimentos(ant => ant.map(item => item.id === idSendoEditado ? { id: idSendoEditado, ...data } : item));
        setIdSendoEditado(null);
        message.success("Estabelecimento atualizado!");
      } else {
        const docRef = await addDoc(collection(db, "estabelecimentos"), data);
        setListaEstabelecimentos(ant => [...ant, { id: docRef.id, ...data }]);
        message.success("Estabelecimento cadastrado!");
      }
      reset(valoresPadrao);
    } catch (error) {
      message.error("Erro ao salvar.");
    }
  };

  const removerEstabelecimento = async (id: string) => {
    try {
      await deleteDoc(doc(db, "estabelecimentos", id));
      setListaEstabelecimentos(ant => ant.filter(item => item.id !== id));
      message.success("Removido com sucesso!");
    } catch (error) {
      message.error("Erro ao remover.");
    }
  };

  const editarEstabelecimento = (item: EstabelecimentoItem) => {
    setIdSendoEditado(item.id);
    reset(item); 
  };

  const columns = [
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    { title: 'Categoria', dataIndex: 'categoria', key: 'categoria' },
    { 
      title: 'Cidade', 
      dataIndex: 'cidade', 
      key: 'cidade',
      render: (cidadeId: string) => {
        const cid = cidades.find(c => c.id === cidadeId);
        return cid ? `${cid.nome} - ${cid.estado}` : 'Cidade não encontrada';
      }
    },
    { 
      title: 'Status', 
      dataIndex: 'ativo', 
      key: 'ativo',
      render: (ativo: boolean) => ativo ? 'Ativo' : 'Inativo'
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (item: EstabelecimentoItem) => (
        <Space>
          <Button type="link" onClick={() => editarEstabelecimento(item)}>Editar</Button>
          <Button danger type="link" onClick={() => removerEstabelecimento(item.id)}>Remover</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>{idSendoEditado ? "Editar Estabelecimento" : "Cadastrar Estabelecimento"}</h2>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Nome" validateStatus={errors.nome ? "error" : ""} help={errors.nome?.message}>
              <Controller name="nome" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Cidade" validateStatus={errors.cidade ? "error" : ""} help={errors.cidade?.message}>
              <Controller 
                name="cidade" 
                control={control} 
                render={({ field }) => (
                  <Select {...field} placeholder="Selecione uma cidade">
                    {cidades.map(cid => (
                      <Select.Option key={cid.id} value={cid.id}>{cid.nome} - {cid.estado}</Select.Option>
                    ))}
                  </Select>
                )} 
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ativo">
              <Controller name="ativo" control={control} render={({ field: { value, onChange } }) => <Switch checked={value} onChange={onChange} />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Categoria" validateStatus={errors.categoria ? "error" : ""} help={errors.categoria?.message}>
              <Controller name="categoria" control={control} render={({ field }) => <Input {...field} placeholder="Ex: Restaurante" />} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Telefone" validateStatus={errors.telefone ? "error" : ""} help={errors.telefone?.message}>
              <Controller name="telefone" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Endereço" validateStatus={errors.endereco ? "error" : ""} help={errors.endereco?.message}>
              <Controller name="endereco" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Descrição" validateStatus={errors.descricao ? "error" : ""} help={errors.descricao?.message}>
          <Controller name="descricao" control={control} render={({ field }) => <Input.TextArea {...field} rows={2} />} />
        </Form.Item>

        <Card title="Horários de Funcionamento" size="small" style={{ marginBottom: 24 }}>
          {WeekDays.map(dia => (
            <Row gutter={16} key={dia} style={{ marginBottom: 8, alignItems: 'center' }}>
              <Col span={4}><strong>{dia.toUpperCase()}:</strong></Col>
              <Col span={4}>
                <Controller name={`horario_funcionamento.${dia}.abre`} control={control} render={({ field }) => <Input {...field} placeholder="Abre (ex: 08:00)" />} />
              </Col>
              <Col span={4}>
                <Controller name={`horario_funcionamento.${dia}.fecha`} control={control} render={({ field }) => <Input {...field} placeholder="Fecha (ex: 18:00)" />} />
              </Col>
            </Row>
          ))}
        </Card>

        <Button type="primary" htmlType="submit" style={{ marginBottom: 32 }}>
          {idSendoEditado ? "Salvar Alterações" : "Cadastrar Estabelecimento"}
        </Button>
        {idSendoEditado && <Button style={{ marginLeft: 8 }} onClick={() => { setIdSendoEditado(null); reset(valoresPadrao); }}>Cancelar</Button>}
      </Form>

      <h3>Estabelecimentos Cadastrados</h3>
      <Table columns={columns} dataSource={listaEstabelecimentos} rowKey="id" />
    </div>
  );
};