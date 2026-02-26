import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Spin, Empty } from 'antd';
import {
    TeamOutlined,
    CalendarOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    RiseOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Dashboard: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardApi.getStats().then((res) => res.data),
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!data) return <Empty description="No data available" />;

    const statCards = [
        {
            title: 'Total Employees',
            value: data.overview.totalEmployees,
            icon: <TeamOutlined />,
            color: '#4f46e5',
            bg: '#eef2ff',
        },
        {
            title: 'Active Employees',
            value: data.overview.activeEmployees,
            icon: <CheckCircleOutlined />,
            color: '#10b981',
            bg: '#ecfdf5',
        },
        {
            title: "Today's Shifts",
            value: data.overview.todayShifts,
            icon: <CalendarOutlined />,
            color: '#f59e0b',
            bg: '#fffbeb',
        },
        {
            title: 'This Week',
            value: data.overview.weekShifts,
            icon: <RiseOutlined />,
            color: '#8b5cf6',
            bg: '#f5f3ff',
        },
        {
            title: 'Pending Leaves',
            value: data.overview.pendingLeaves,
            icon: <ClockCircleOutlined />,
            color: '#ef4444',
            bg: '#fef2f2',
        },
        {
            title: 'Approved Leaves',
            value: data.overview.approvedLeaves,
            icon: <FileTextOutlined />,
            color: '#06b6d4',
            bg: '#ecfeff',
        },
    ];

    const shiftColumns = [
        {
            title: 'Employee',
            dataIndex: 'employee',
            render: (emp: any) => `${emp.firstName} ${emp.lastName}`,
        },
        {
            title: 'Shift',
            dataIndex: 'title',
        },
        {
            title: 'Start',
            dataIndex: 'startTime',
            render: (t: string) => new Date(t).toLocaleString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => {
                const colors: Record<string, string> = {
                    SCHEDULED: 'blue',
                    IN_PROGRESS: 'orange',
                    COMPLETED: 'green',
                    CANCELLED: 'red',
                };
                return <Tag color={colors[s] || 'default'}>{s}</Tag>;
            },
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 4 }}>Dashboard Overview</Title>
                <Text type="secondary">Welcome back! Here's what's happening today.</Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statCards.map((stat, idx) => (
                    <Col xs={24} sm={12} lg={8} xl={4} key={idx}>
                        <Card className="stat-card" style={{ borderRadius: 12, border: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: stat.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 22,
                                        color: stat.color,
                                    }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{stat.title}</Text>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', lineHeight: 1.2 }}>
                                        {stat.value}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Shifts by Status" style={{ borderRadius: 12, border: 'none' }}>
                        {data.shiftsByStatus.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.shiftsByStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                        label={({ status, count }) => `${status}: ${count}`}
                                    >
                                        {data.shiftsByStatus.map((_: any, index: number) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="No shift data" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Employees by Department" style={{ borderRadius: 12, border: 'none' }}>
                        {data.departmentStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.departmentStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="No department data" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="Recent Shifts" style={{ borderRadius: 12, border: 'none' }}>
                        <Table
                            columns={shiftColumns}
                            dataSource={data.recentShifts}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
