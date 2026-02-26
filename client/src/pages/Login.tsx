import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            message.success('Welcome back!');
            navigate('/dashboard');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 440, padding: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            marginBottom: 16,
                        }}
                    >
                        <CalendarOutlined style={{ fontSize: 32, color: '#fff' }} />
                    </div>
                    <Title level={2} style={{ color: '#fff', marginBottom: 4 }}>
                        ShiftSync
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                        Employee Shift Scheduling System
                    </Text>
                </div>

                <Card
                    style={{
                        borderRadius: 16,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        border: 'none',
                    }}
                >
                    <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
                        Sign in to your account
                    </Title>

                    <Form layout="vertical" onFinish={onFinish} size="large">
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email' },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email address" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please enter your password' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, borderRadius: 8 }}>
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider plain>
                        <Text type="secondary" style={{ fontSize: 13 }}>or</Text>
                    </Divider>

                    <Paragraph style={{ textAlign: 'center', marginBottom: 0 }}>
                        <Text type="secondary">Don't have an account? </Text>
                        <Link to="/register">Sign up</Link>
                    </Paragraph>
                </Card>

                {/* <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                        Demo: admin@company.com / admin123
                    </Text>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
