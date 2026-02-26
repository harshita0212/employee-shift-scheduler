import React, { useState } from 'react';
import {
    Card, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space, message,
    Popconfirm, Typography, Row, Col,
} from 'antd';
import {
    PlusOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leaves';
import { employeeApi } from '../api/employees';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Leaves: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { isManager } = useAuth();

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['leaves', statusFilter],
        queryFn: () => leaveApi.getAll({ status: statusFilter }).then((r) => r.data),
    });

    const { data: employeesData } = useQuery({
        queryKey: ['employees-list'],
        queryFn: () => employeeApi.getAll({ limit: 100 }).then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (values: any) => leaveApi.create(values),
        onSuccess: () => {
            message.success('Leave request submitted');
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            setModalOpen(false);
            form.resetFields();
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => leaveApi.updateStatus(id, status),
        onSuccess: () => {
            message.success('Leave status updated');
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
    });

    const handleSubmit = (values: any) => {
        const payload = {
            employeeId: values.employeeId,
            startDate: values.dateRange[0].toISOString(),
            endDate: values.dateRange[1].toISOString(),
            reason: values.reason,
            type: values.type,
        };
        createMutation.mutate(payload);
    };

    const columns = [
        {
            title: 'Employee',
            key: 'employee',
            render: (_: any, r: any) => `${r.employee?.firstName} ${r.employee?.lastName}`,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (t: string) => <Tag>{t}</Tag>,
        },
        {
            title: 'Start',
            dataIndex: 'startDate',
            render: (d: string) => dayjs(d).format('MMM DD, YYYY'),
        },
        {
            title: 'End',
            dataIndex: 'endDate',
            render: (d: string) => dayjs(d).format('MMM DD, YYYY'),
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            ellipsis: true,
            render: (r: string) => r || '—',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => {
                const colors: Record<string, string> = { PENDING: 'orange', APPROVED: 'green', REJECTED: 'red' };
                return <Tag color={colors[s] || 'default'}>{s}</Tag>;
            },
        },
        ...(isManager
            ? [{
                title: 'Actions',
                key: 'actions',
                render: (_: any, record: any) =>
                    record.status === 'PENDING' ? (
                        <Space>
                            <Button
                                type="link"
                                icon={<CheckCircleOutlined />}
                                style={{ color: '#10b981' }}
                                onClick={() => statusMutation.mutate({ id: record.id, status: 'APPROVED' })}
                            >
                                Approve
                            </Button>
                            <Button
                                type="link"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => statusMutation.mutate({ id: record.id, status: 'REJECTED' })}
                            >
                                Reject
                            </Button>
                        </Space>
                    ) : null,
            }]
            : []),
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col><Title level={4} style={{ marginBottom: 0 }}>Leave Management</Title></Col>
                <Col>
                    <Space>
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: 160 }}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'PENDING', label: 'Pending' },
                                { value: 'APPROVED', label: 'Approved' },
                                { value: 'REJECTED', label: 'Rejected' },
                            ]}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => { form.resetFields(); setModalOpen(true); }}
                        >
                            Request Leave
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, border: 'none' }}>
                <Table
                    columns={columns}
                    dataSource={leaves}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Request Leave"
                open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); }}
                onOk={() => form.submit()}
                confirmLoading={createMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Select employee"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                            options={
                                (employeesData?.employees || []).map((e: any) => ({
                                    value: e.id,
                                    label: `${e.firstName} ${e.lastName}`,
                                }))
                            }
                        />
                    </Form.Item>

                    <Form.Item name="type" label="Leave Type" initialValue="PERSONAL">
                        <Select
                            options={[
                                { value: 'PERSONAL', label: 'Personal' },
                                { value: 'SICK', label: 'Sick' },
                                { value: 'VACATION', label: 'Vacation' },
                                { value: 'EMERGENCY', label: 'Emergency' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item name="dateRange" label="Date Range" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="reason" label="Reason">
                        <TextArea rows={3} placeholder="Reason for leave..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Leaves;
