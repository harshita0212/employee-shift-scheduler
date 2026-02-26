import React, { useState } from 'react';
import { Card, Modal, Form, Input, Select, DatePicker, message, Row, Col, Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftApi } from '../api/shifts';
import { employeeApi } from '../api/employees';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: '#4f46e5',
    IN_PROGRESS: '#f59e0b',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
};

const Shifts: React.FC = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<any>(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { isManager } = useAuth();

    const { data: shifts } = useQuery({
        queryKey: ['shifts'],
        queryFn: () => shiftApi.getAll().then((r) => r.data),
    });

    const { data: employeesData } = useQuery({
        queryKey: ['employees-list'],
        queryFn: () => employeeApi.getAll({ limit: 100 }).then((r) => r.data),
    });

    const createMutation = useMutation({
        mutationFn: (values: any) => shiftApi.create(values),
        onSuccess: () => {
            message.success('Shift created');
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            closeModal();
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Failed to create shift'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => shiftApi.update(id, data),
        onSuccess: () => {
            message.success('Shift updated');
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            closeModal();
        },
        onError: (e: any) => message.error(e.response?.data?.message || 'Failed to update shift'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => shiftApi.delete(id),
        onSuccess: () => {
            message.success('Shift deleted');
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            closeModal();
        },
    });

    const closeModal = () => {
        setModalOpen(false);
        setEditingShift(null);
        form.resetFields();
    };

    const calendarEvents = (shifts || []).map((shift: any) => ({
        id: shift.id,
        title: `${shift.title} — ${shift.employee?.firstName} ${shift.employee?.lastName}`,
        start: shift.startTime,
        end: shift.endTime,
        backgroundColor: STATUS_COLORS[shift.status] || '#4f46e5',
        borderColor: 'transparent',
        extendedProps: shift,
    }));

    const handleDateSelect = (selectInfo: any) => {
        if (!isManager) return;
        form.setFieldsValue({
            startTime: dayjs(selectInfo.startStr),
            endTime: dayjs(selectInfo.endStr),
        });
        setModalOpen(true);
    };

    const handleEventClick = (clickInfo: any) => {
        const shift = clickInfo.event.extendedProps;
        setEditingShift(shift);
        form.setFieldsValue({
            title: shift.title,
            employeeId: shift.employeeId,
            startTime: dayjs(shift.startTime),
            endTime: dayjs(shift.endTime),
            status: shift.status,
            notes: shift.notes,
        });
        setModalOpen(true);
    };

    const handleSubmit = (values: any) => {
        const payload = {
            title: values.title,
            employeeId: values.employeeId,
            startTime: values.startTime.toISOString(),
            endTime: values.endTime.toISOString(),
            notes: values.notes,
            status: values.status,
        };

        if (editingShift) {
            updateMutation.mutate({ id: editingShift.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col><Title level={4} style={{ marginBottom: 0 }}>Shift Schedule</Title></Col>
                <Col>
                    {isManager && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setEditingShift(null); setModalOpen(true); }}>
                            New Shift
                        </Button>
                    )}
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, border: 'none' }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    events={calendarEvents}
                    selectable={isManager}
                    editable={false}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    height="auto"
                    slotMinTime="06:00:00"
                    slotMaxTime="23:00:00"
                    allDaySlot={false}
                    eventDisplay="block"
                    dayMaxEvents={3}
                />
            </Card>

            <Modal
                title={editingShift ? 'Edit Shift' : 'Create Shift'}
                open={modalOpen}
                onCancel={closeModal}
                footer={
                    <Space>
                        {editingShift && isManager && (
                            <Button danger onClick={() => deleteMutation.mutate(editingShift.id)} loading={deleteMutation.isPending}>
                                Delete
                            </Button>
                        )}
                        <Button onClick={closeModal}>Cancel</Button>
                        {isManager && (
                            <Button type="primary" onClick={() => form.submit()} loading={createMutation.isPending || updateMutation.isPending}>
                                {editingShift ? 'Update' : 'Create'}
                            </Button>
                        )}
                    </Space>
                }
                width={560}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="title" label="Shift Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g., Morning Shift" />
                    </Form.Item>

                    <Form.Item name="employeeId" label="Assign Employee" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            placeholder="Select employee"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                            options={
                                (employeesData?.employees || []).map((e: any) => ({
                                    value: e.id,
                                    label: `${e.firstName} ${e.lastName} (${e.department || 'N/A'})`,
                                }))
                            }
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
                                <DatePicker showTime style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
                                <DatePicker showTime style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    {editingShift && (
                        <Form.Item name="status" label="Status">
                            <Select
                                options={[
                                    { value: 'SCHEDULED', label: 'Scheduled' },
                                    { value: 'IN_PROGRESS', label: 'In Progress' },
                                    { value: 'COMPLETED', label: 'Completed' },
                                    { value: 'CANCELLED', label: 'Cancelled' },
                                ]}
                            />
                        </Form.Item>
                    )}

                    <Form.Item name="notes" label="Notes">
                        <TextArea rows={3} placeholder="Additional notes..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Shifts;
