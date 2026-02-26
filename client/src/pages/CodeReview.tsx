import React, { useState } from 'react';
import {
    Card, Button, Row, Col, Typography, Tag, Progress, Collapse, Space, Alert, Empty, Spin, Badge,
} from 'antd';
import {
    CodeOutlined, BugOutlined, CheckCircleOutlined, ThunderboltOutlined,
    WarningOutlined, InfoCircleOutlined, TrophyOutlined, FileTextOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { codeReviewApi } from '../api/code-review';

const { Title, Text, Paragraph } = Typography;

interface Issue {
    line: number;
    type: 'error' | 'warning' | 'info';
    rule: string;
    message: string;
    original: string;
}

interface FileResult {
    file: string;
    path: string;
    lines: number;
    issues: Issue[];
    score: number;
    grade: string;
    suggestions: string[];
    fixedCode: string;
}

interface Summary {
    totalFiles: number;
    cleanFiles: number;
    filesWithIssues: number;
    totalIssues: number;
    overallScore: number;
    overallGrade: string;
    verdict: string;
}

interface ReviewData {
    files: FileResult[];
    summary: Summary;
}

const gradeColors: Record<string, string> = {
    A: '#52c41a', B: '#1890ff', C: '#faad14', D: '#fa8c16', F: '#f5222d',
};

const issueIcons: Record<string, React.ReactNode> = {
    error: <BugOutlined style={{ color: '#f5222d' }} />,
    warning: <WarningOutlined style={{ color: '#faad14' }} />,
    info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
};

const issueColors: Record<string, string> = {
    error: 'red', warning: 'orange', info: 'blue',
};

const CodeReview: React.FC = () => {
    const [data, setData] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasRun, setHasRun] = useState(false);

    const runReview = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await codeReviewApi.runReview();
            setData(res.data);
            setHasRun(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Review failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <Title level={4} style={{ marginBottom: 4 }}>
                            <RocketOutlined style={{ marginRight: 8 }} />
                            AI Code Review
                        </Title>
                        <Text type="secondary">
                            Scan your entire project for code quality issues and get instant fixes.
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ThunderboltOutlined />}
                        onClick={runReview}
                        loading={loading}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: 10,
                            height: 48,
                            paddingInline: 32,
                            fontWeight: 600,
                            fontSize: 15,
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        }}
                    >
                        {loading ? 'Scanning...' : hasRun ? 'Run Again' : 'Run AI Review'}
                    </Button>
                </div>
            </div>

            {error && (
                <Alert message="Review Failed" description={error} type="error" showIcon closable style={{ marginBottom: 24 }} />
            )}

            {loading && (
                <Card style={{ borderRadius: 12, border: 'none', textAlign: 'center', padding: 60 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary" style={{ fontSize: 15 }}>Analyzing your codebase...</Text>
                    </div>
                </Card>
            )}

            {!loading && !hasRun && (
                <Card style={{ borderRadius: 12, border: 'none', textAlign: 'center', padding: 40 }}>
                    <CodeOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                    <Title level={5} type="secondary">Click "Run AI Review" to scan your project</Title>
                    <Text type="secondary">The AI will analyze all .ts, .tsx, .js, and .jsx files in your server and client folders.</Text>
                </Card>
            )}

            {!loading && data && (
                <>
                    {/* Summary Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={8} lg={5}>
                            <Card style={{ borderRadius: 12, border: 'none', textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 700, color: gradeColors[data.summary.overallGrade] }}>
                                    {data.summary.overallGrade}
                                </div>
                                <Text type="secondary">Overall Grade</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={16} lg={7}>
                            <Card style={{ borderRadius: 12, border: 'none' }}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Quality Score</Text>
                                </div>
                                <Progress
                                    percent={data.summary.overallScore * 10}
                                    strokeColor={gradeColors[data.summary.overallGrade]}
                                    format={() => `${data!.summary.overallScore}/10`}
                                    size={['100%', 20]}
                                />
                                <Text type="secondary" style={{ fontSize: 12 }}>{data.summary.verdict}</Text>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card style={{ borderRadius: 12, border: 'none' }}>
                                <Row gutter={16}>
                                    <Col span={6} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{data.summary.totalFiles}</div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>Total Files</Text>
                                    </Col>
                                    <Col span={6} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{data.summary.cleanFiles}</div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>Clean</Text>
                                    </Col>
                                    <Col span={6} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14' }}>{data.summary.filesWithIssues}</div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>With Issues</Text>
                                    </Col>
                                    <Col span={6} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#f5222d' }}>{data.summary.totalIssues}</div>
                                        <Text type="secondary" style={{ fontSize: 11 }}>Total Issues</Text>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    {/* File Results */}
                    <Title level={5} style={{ marginBottom: 16 }}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        File Results
                    </Title>

                    <Collapse
                        accordion
                        style={{ borderRadius: 12, border: 'none' }}
                        items={data.files.map((file, idx) => ({
                            key: idx,
                            label: (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 8 }}>
                                    <Space>
                                        {file.issues.length === 0 ? (
                                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                        ) : (
                                            <Badge count={file.issues.length} size="small" />
                                        )}
                                        <Text strong style={{ fontSize: 13 }}>{file.file}</Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>{file.path}</Text>
                                    </Space>
                                    <Space>
                                        <Tag color={gradeColors[file.grade]} style={{ marginRight: 0 }}>
                                            {file.grade} · {file.score}/10
                                        </Tag>
                                    </Space>
                                </div>
                            ),
                            children: (
                                <div>
                                    {file.issues.length === 0 ? (
                                        <Alert message="No issues found — this file is clean!" type="success" showIcon />
                                    ) : (
                                        <>
                                            {/* Issues */}
                                            <div style={{ marginBottom: 16 }}>
                                                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Issues</Text>
                                                {file.issues.map((issue, i) => (
                                                    <div key={i} style={{
                                                        padding: '8px 12px',
                                                        background: '#fafafa',
                                                        borderRadius: 8,
                                                        marginBottom: 6,
                                                        borderLeft: `3px solid ${issueColors[issue.type] === 'orange' ? '#faad14' : issueColors[issue.type] === 'red' ? '#f5222d' : '#1890ff'}`,
                                                    }}>
                                                        <Space align="start">
                                                            {issueIcons[issue.type]}
                                                            <div>
                                                                <div>
                                                                    <Tag color={issueColors[issue.type]} style={{ fontSize: 10 }}>
                                                                        {issue.type.toUpperCase()}
                                                                    </Tag>
                                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                                        {issue.line > 0 ? `Line ${issue.line}` : 'General'}
                                                                    </Text>
                                                                </div>
                                                                <Text style={{ fontSize: 13 }}>{issue.message}</Text>
                                                                {issue.line > 0 && (
                                                                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                                                                        {issue.original}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Space>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Suggestions */}
                                            {file.suggestions.length > 0 && (
                                                <div style={{ marginBottom: 16 }}>
                                                    <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                                                        💡 Suggestions
                                                    </Text>
                                                    {file.suggestions.map((s, i) => (
                                                        <Paragraph key={i} style={{ marginBottom: 4, fontSize: 13, color: '#595959' }}>
                                                            {i + 1}. {s}
                                                        </Paragraph>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Fixed Code */}
                                            <div>
                                                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                                                    🔧 Fixed Code
                                                </Text>
                                                <pre style={{
                                                    background: '#1e1e1e',
                                                    color: '#d4d4d4',
                                                    padding: 16,
                                                    borderRadius: 8,
                                                    overflow: 'auto',
                                                    maxHeight: 300,
                                                    fontSize: 12,
                                                    lineHeight: 1.5,
                                                }}>
                                                    {file.fixedCode}
                                                </pre>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ),
                        }))}
                    />
                </>
            )}
        </div>
    );
};

export default CodeReview;
