import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd';
import {
    DashboardOutlined,
    TeamOutlined,
    CalendarOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    LogoutOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BellOutlined,
    CodeOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/employees',
            icon: <TeamOutlined />,
            label: 'Employees',
        },
        {
            key: '/shifts',
            icon: <CalendarOutlined />,
            label: 'Shifts',
        },
        {
            key: '/leaves',
            icon: <FileTextOutlined />,
            label: 'Leaves',
        },
        {
            key: '/availability',
            icon: <ClockCircleOutlined />,
            label: 'Availability',
        },
        {
            key: '/code-review',
            icon: <CodeOutlined />,
            label: 'AI Review',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            logout();
            navigate('/login');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="sidebar-gradient"
                width={260}
                style={{ position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}
            >
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '0' : '0 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <CalendarOutlined style={{ fontSize: 24, color: '#fff' }} />
                    {!collapsed && (
                        <Text strong style={{ color: '#fff', fontSize: 18, marginLeft: 12, letterSpacing: '-0.5px' }}>
                            ShiftSync
                        </Text>
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{
                        background: 'transparent',
                        borderRight: 'none',
                        marginTop: 8,
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 0,
                        right: 0,
                        padding: '0 16px',
                    }}
                >
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            padding: collapsed ? '12px 6px' : '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <Avatar
                            size={36}
                            style={{ backgroundColor: '#818cf8', flexShrink: 0 }}
                            icon={<UserOutlined />}
                        />
                        {!collapsed && (
                            <div style={{ overflow: 'hidden' }}>
                                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 600, display: 'block' }} ellipsis>
                                    {user?.employee?.firstName} {user?.employee?.lastName}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                                    {user?.role}
                                </Text>
                            </div>
                        )}
                    </div>
                </div>
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center' }}
                        >
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </div>
                        <Text strong style={{ fontSize: 16, color: '#1f2937' }}>
                            {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
                        </Text>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Badge count={3} size="small">
                            <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#6b7280' }} />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <Avatar size={32} style={{ backgroundColor: '#4f46e5' }} icon={<UserOutlined />} />
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>{user?.email}</Text>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{ margin: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
