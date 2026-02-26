import React, { useState } from 'react';
import {
    Card, Table, Button, Modal, Form, Select, TimePicker, Switch, message,
    Typography, Row, Col, Tag, Space,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityApi } from '../api/availability';
import { employeeApi } from '../api/employees';
import dayjs from 'dayjs';

const { Title } = Typography;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#4f46e5', '#8b5cf6', '#ec4899'];

const Availability: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: availabilities, isLoading } = useQuery({
        queryKey: ['availability'],
        queryFn: () => availabilityApi.getAll().then((r) => r.data),
    });

    const { data: employeesData } = useQuery({
        queryKey: ['employees-list'],
        queryFn: () => employeeApi.getAll({ limit: 100 }).then((r) => r.data),
    });

    const setMutation = useMutation({
        mutationFn: ({ employeeId, availabilities }: any) =>
            availabilityApi.set(employeeId, availabilities),
        onSuccess: () => {
            message.success('Availability saved');
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            setModalOpen(false);
            form.resetFields();
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Error'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => availabilityApi.delete(id),
        onSuccess: () => {
            message.success('Availability deleted');
            queryClient.invalidateQueries({ queryKey: ['availability'] });
        },
    });

    const handleSubmit = (values: any) => {
        const avails = values.slots.map((slot: any) => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.timeRange[0].format('HH:mm'),
            endTime: slot.timeRange[1].format('HH:mm'),
            isActive: slot.isActive ?? true,
        }));
        setMutation.mutate({ employeeId: values.employeeId, availabilities: avails });
    };

    const columns = [
        {
            title: 'Employee',
            key: 'employee',
            render: (_: any, r: any) =>
                r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '—',
        },
        {
            title: 'Day',
            dataIndex: 'dayOfWeek',
            render: (d: number) => <Tag color={DAY_COLORS[d]}>{DAYS[d]}</Tag>,
            sorter: (a: any, b: any) => a.dayOfWeek - b.dayOfWeek,
        },
        {
            title: 'Start',
            dataIndex: 'startTime',
        },
        {
            title: 'End',
            dataIndex: 'endTime',
        },
        {
            title: 'Active',
            dataIndex: 'isActive',
            render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteMutation.mutate(record.id)} />
            ),
        },
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col><Title level={4} style={{ marginBottom: 0 }}>Availability</Title></Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
                        Set Availability
                    </Button>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, border: 'none' }}>
                <Table
                    columns={columns}
                    dataSource={availabilities}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Set Weekly Availability"
                open={modalOpen}
                onCancel={() => { setModalOpen(false); form.resetFields(); }}
                onOk={() => form.submit()}
                confirmLoading={setMutation.isPending}
                width={640}
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

                    <Form.List name="slots" initialValue={[{}]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row gutter={12} key={key} align="middle" style={{ marginBottom: 8 }}>
                                        <Col span={7}>
                                            <Form.Item {...restField} name={[name, 'dayOfWeek']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                                <Select placeholder="Day" options={DAYS.map((d, i) => ({ value: i, label: d }))} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item {...restField} name={[name, 'timeRange']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                                <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={3}>
                                            <Form.Item {...restField} name={[name, 'isActive']} valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
                                                <Switch size="small" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            {fields.length > 1 && (
                                                <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                            )}
                                        </Col>
                                    </Row>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Time Slot
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
};

export default Availability;
