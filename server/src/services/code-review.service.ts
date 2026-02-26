import fs from 'fs';
import path from 'path';

// ── Types ────────────────────────────────────────────────

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

interface ReviewSummary {
    totalFiles: number;
    cleanFiles: number;
    filesWithIssues: number;
    totalIssues: number;
    overallScore: number;
    overallGrade: string;
    verdict: string;
}

interface ReviewResult {
    files: FileResult[];
    summary: ReviewSummary;
}

// ── File Scanner ─────────────────────────────────────────

function getFiles(dir: string, extensions: string[]): string[] {
    let results: string[] = [];

    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir);
    for (const item of items) {
        if (['node_modules', '.git', 'prisma', 'dist'].includes(item)) continue;

        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(getFiles(fullPath, extensions));
        } else {
            const ext = path.extname(item);
            if (extensions.includes(ext)) {
                results.push(fullPath);
            }
        }
    }

    return results;
}

// ── Review Logic ─────────────────────────────────────────

function reviewCode(code: string): { issues: Issue[]; score: number; grade: string; suggestions: string[] } {
    const issues: Issue[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();

        if (trimmed.length === 0 || trimmed.startsWith('//')) return;

        // Missing type validation in functions
        if (/function\s+\w+\s*\(/.test(trimmed) && !trimmed.includes('typeof')) {
            issues.push({ line: lineNum, type: 'warning', rule: 'type-check', message: 'Function has no type validation for its parameters', original: trimmed });
        }

        // var usage
        if (/\bvar\b/.test(trimmed)) {
            issues.push({ line: lineNum, type: 'warning', rule: 'no-var', message: "Use 'let' or 'const' instead of 'var'", original: trimmed });
        }

        // Loose equality
        if (/[^=!]={2}[^=]/.test(trimmed)) {
            issues.push({ line: lineNum, type: 'warning', rule: 'strict-equality', message: "Use '===' instead of '==' for strict comparison", original: trimmed });
        }

        // One-liner functions
        if (/function\s+\w+\s*\(.*\)\s*\{.*\}/.test(trimmed)) {
            issues.push({ line: lineNum, type: 'info', rule: 'formatting', message: 'Function body is on one line — expand for readability', original: trimmed });
        }

        // Missing semicolons
        if (
            !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') &&
            !trimmed.endsWith('(') && !trimmed.endsWith(',') &&
            !trimmed.startsWith('function') && !trimmed.startsWith('if') &&
            !trimmed.startsWith('else') && !trimmed.startsWith('for') && !trimmed.startsWith('while') &&
            /[\w)"']$/.test(trimmed)
        ) {
            issues.push({ line: lineNum, type: 'info', rule: 'semicolon', message: 'Possibly missing semicolon', original: trimmed });
        }

        // console.log in production
        if (/console\.log\s*\(/.test(trimmed)) {
            issues.push({ line: lineNum, type: 'info', rule: 'no-console', message: 'Avoid console.log in production — use a proper logger', original: trimmed });
        }
    });

    // No error handling
    if (!/try\s*\{/.test(code)) {
        issues.push({ line: 0, type: 'warning', rule: 'error-handling', message: 'No error handling found — consider adding try/catch blocks', original: '(entire code)' });
    }

    // Score
    const warnings = issues.filter(i => i.type === 'warning').length;
    const infos = issues.filter(i => i.type === 'info').length;
    const errors = issues.filter(i => i.type === 'error').length;
    const deductions = errors * 2 + warnings * 1 + infos * 0.5;
    const score = Math.max(0, Math.min(10, Math.round(10 - deductions)));

    // Grade
    let grade: string;
    if (score >= 9) grade = 'A';
    else if (score >= 7) grade = 'B';
    else if (score >= 5) grade = 'C';
    else if (score >= 3) grade = 'D';
    else grade = 'F';

    // Suggestions
    const suggestions: string[] = [];
    const rules = new Set(issues.map(i => i.rule));
    if (rules.has('no-var')) suggestions.push("Replace all 'var' declarations with 'const' or 'let'.");
    if (rules.has('strict-equality')) suggestions.push("Use strict equality (===) to avoid type coercion bugs.");
    if (rules.has('type-check')) suggestions.push("Add type checks (typeof) to validate function inputs.");
    if (rules.has('error-handling')) suggestions.push("Wrap risky operations in try/catch blocks.");
    if (rules.has('formatting')) suggestions.push("Break one-liner functions into multiple lines.");
    if (rules.has('semicolon')) suggestions.push("Add semicolons at the end of statements.");
    if (rules.has('no-console')) suggestions.push("Replace console.log with a logging library.");
    if (suggestions.length === 0) suggestions.push("Code looks great! Keep following best practices.");

    return { issues, score, grade, suggestions };
}

// ── Fix Logic ────────────────────────────────────────────

function fixCode(code: string): string {
    const lines = code.split('\n');
    const fixed: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();

        if (trimmed.length === 0 || trimmed.startsWith('//')) {
            fixed.push(line);
            continue;
        }

        // var → const
        line = line.replace(/\bvar\b/g, 'const');

        // == → ===
        line = line.replace(/([^=!])={2}([^=])/g, '$1===$2');

        // Add semicolons
        const t = line.trim();
        if (
            t.length > 0 && !t.endsWith(';') && !t.endsWith('{') && !t.endsWith('}') &&
            !t.startsWith('//') && !t.startsWith('if') && !t.startsWith('else') &&
            !t.startsWith('function') && !t.startsWith('try') && !t.startsWith('catch') &&
            /[\w)"']$/.test(t)
        ) {
            line = line.replace(/\s*$/, ';');
        }

        // Expand one-liner functions + type validation
        const funcMatch = line.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{\s*return\s+(.*)\s*\}$/);
        if (funcMatch) {
            const [, indent, name, params, body] = funcMatch;
            const paramList = params.split(',').map(p => p.trim());
            fixed.push(`${indent}function ${name}(${paramList.join(', ')}) {`);
            paramList.forEach(param => {
                fixed.push(`${indent}  if (typeof ${param} !== "number") {`);
                fixed.push(`${indent}    throw new Error("${name}(): '${param}' must be a number, got " + typeof ${param});`);
                fixed.push(`${indent}  }`);
            });
            fixed.push('');
            fixed.push(`${indent}  return ${body};`);
            fixed.push(`${indent}}`);
            continue;
        }

        fixed.push(line);
    }

    return fixed.join('\n');
}

// ── Service ──────────────────────────────────────────────

class CodeReviewService {
    runFullReview(): ReviewResult {
        const projectRoot = path.resolve(__dirname, '..', '..', '..');
        const extensions = ['.js', '.ts', '.tsx', '.jsx'];
        const dirs = [
            path.join(projectRoot, 'server', 'src'),
            path.join(projectRoot, 'client', 'src'),
        ];

        let allFiles: string[] = [];
        for (const dir of dirs) {
            allFiles = allFiles.concat(getFiles(dir, extensions));
        }

        let totalScore = 0;
        let cleanFiles = 0;
        let filesWithIssues = 0;
        let totalIssues = 0;

        const fileResults: FileResult[] = allFiles.map(filePath => {
            const code = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
            const relativePath = path.relative(projectRoot, filePath);
            const { issues, score, grade, suggestions } = reviewCode(code);

            totalScore += score;
            totalIssues += issues.length;
            if (issues.length === 0) {
                cleanFiles++;
            } else {
                filesWithIssues++;
            }

            const fixedCode = issues.length > 0 ? fixCode(code) : code;

            return {
                file: path.basename(filePath),
                path: relativePath.replace(/\\/g, '/'),
                lines: code.split('\n').length,
                issues,
                score,
                grade,
                suggestions,
                fixedCode,
            };
        });

        const avgScore = allFiles.length > 0 ? Math.round(totalScore / allFiles.length) : 10;
        let overallGrade: string;
        if (avgScore >= 9) overallGrade = 'A';
        else if (avgScore >= 7) overallGrade = 'B';
        else if (avgScore >= 5) overallGrade = 'C';
        else if (avgScore >= 3) overallGrade = 'D';
        else overallGrade = 'F';

        const verdict = avgScore >= 8
            ? 'Excellent — project is in great shape!'
            : avgScore >= 5
                ? 'Fair — some files need attention.'
                : 'Poor — several files need improvements.';

        return {
            files: fileResults,
            summary: {
                totalFiles: allFiles.length,
                cleanFiles,
                filesWithIssues,
                totalIssues,
                overallScore: avgScore,
                overallGrade,
                verdict,
            },
        };
    }
}

export const codeReviewService = new CodeReviewService();
