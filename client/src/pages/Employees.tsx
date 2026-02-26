import React, { useState } from 'react';
import {
    Card, Table, Button, Modal, Form, Input, Select, Tag, Space, message,
    Popconfirm, Typography, Row, Col, Avatar,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employees';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Employees: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { isManager } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['employees', page, search],
        queryFn: () => employeeApi.getAll({ page, limit: 10, search }).then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (values: any) => employeeApi.create(values),
        onSuccess: () => {
            message.success('Employee created');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setModalOpen(false);
            form.resetFields();
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => employeeApi.update(id, data),
        onSuccess: () => {
            message.success('Employee updated');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setModalOpen(false);
            setEditingId(null);
            form.resetFields();
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => employeeApi.delete(id),
        onSuccess: () => {
            message.success('Employee deleted');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
    });

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setModalOpen(true);
    };

    const handleSubmit = (values: any) => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const columns = [
        {
            title: 'Employee',
            key: 'name',
            render: (_: any, r: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar style={{ backgroundColor: '#4f46e5' }} icon={<UserOutlined />} />
                    <div>
                        <Text strong>{r.firstName} {r.lastName}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{r.user?.email}</Text>
                    </div>
                </div>
            ),
        },
        { title: 'Department', dataIndex: 'department', render: (d: string) => d || '—' },
        { title: 'Position', dataIndex: 'position', render: (p: string) => p || '—' },
        { title: 'Phone', dataIndex: 'phone', render: (p: string) => p || '—' },
        {
            title: 'Status',
            dataIndex: 'isActive',
            render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
        },
        {
            title: 'Role',
            dataIndex: ['user', 'role'],
            render: (r: string) => {
                const colors: Record<string, string> = { ADMIN: 'purple', MANAGER: 'blue', EMPLOYEE: 'default' };
                return <Tag color={colors[r] || 'default'}>{r}</Tag>;
            },
        },
        ...(isManager
            ? [{
                title: 'Actions',
                key: 'actions',
                render: (_: any, record: any) => (
                    <Space>
                        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                        <Popconfirm title="Delete this employee?" onConfirm={() => deleteMutation.mutate(record.id)}>
                            <Button type="link" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                ),
            }]
            : []),
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={4} style={{ marginBottom: 0 }}>Employees</Title>
                </Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Search employees..."
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: 240 }}
                            allowClear
                        />
                        {isManager && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}
                            >
                                Add Employee
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, border: 'none' }}>
                <Table
                    columns={columns}
                    dataSource={data?.employees}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: page,
                        total: data?.pagination?.total,
                        pageSize: 10,
                        onChange: setPage,
                        showSizeChanger: false,
                    }}
                />
            </Card>

            <Modal
                title={editingId ? 'Edit Employee' : 'Add Employee'}
                open={modalOpen}
                onCancel={() => { setModalOpen(false); setEditingId(null); form.resetFields(); }}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                width={560}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    {!editingId && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="department" label="Department">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="position" label="Position">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone">
                                <Input />
                            </Form.Item>
                        </Col>
                        {!editingId && (
                            <Col span={12}>
                                <Form.Item name="role" label="Role" initialValue="EMPLOYEE">
                                    <Select
                                        options={[
                                            { value: 'EMPLOYEE', label: 'Employee' },
                                            { value: 'MANAGER', label: 'Manager' },
                                            { value: 'ADMIN', label: 'Admin' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default Employees;
