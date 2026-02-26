// review-agent.js - AI Code Review Agent
// Usage: const { review } = require("./review-agent");
//        const result = review(codeString);

/**
 * Reviews a code string and returns a full report with:
 *   - issues: array of detected problems
 *   - score: quality score out of 10
 *   - suggestions: improvement tips
 *   - grade: letter grade (A–F)
 *
 * @param {string} code - The source code to review
 * @returns {object} { issues, score, grade, suggestions }
 */
function review(code) {
    const issues = [];
    const lines = code.split("\n");
    const codeLines = lines.filter((l) => l.trim().length > 0 && !l.trim().startsWith("//"));

    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();

        if (trimmed.length === 0 || trimmed.startsWith("//")) return;

        // 1. Missing type validation in functions
        if (/function\s+\w+\s*\(/.test(trimmed) && !trimmed.includes("typeof")) {
            issues.push({
                line: lineNum,
                type: "warning",
                rule: "type-check",
                message: "Function has no type validation for its parameters",
                original: trimmed,
            });
        }

        // 2. 'var' usage
        if (/\bvar\b/.test(trimmed)) {
            issues.push({
                line: lineNum,
                type: "warning",
                rule: "no-var",
                message: "Use 'let' or 'const' instead of 'var'",
                original: trimmed,
            });
        }

        // 3. Loose equality
        if (/[^=!]={2}[^=]/.test(trimmed)) {
            issues.push({
                line: lineNum,
                type: "warning",
                rule: "strict-equality",
                message: "Use '===' instead of '==' for strict comparison",
                original: trimmed,
            });
        }

        // 4. One-liner functions
        if (/function\s+\w+\s*\(.*\)\s*\{.*\}/.test(trimmed)) {
            issues.push({
                line: lineNum,
                type: "info",
                rule: "formatting",
                message: "Function body is on one line — expand for readability",
                original: trimmed,
            });
        }

        // 5. Missing semicolons
        if (
            !trimmed.endsWith(";") &&
            !trimmed.endsWith("{") &&
            !trimmed.endsWith("}") &&
            !trimmed.endsWith("(") &&
            !trimmed.endsWith(",") &&
            !trimmed.startsWith("function") &&
            !trimmed.startsWith("if") &&
            !trimmed.startsWith("else") &&
            !trimmed.startsWith("for") &&
            !trimmed.startsWith("while") &&
            /[\w)"']$/.test(trimmed)
        ) {
            issues.push({
                line: lineNum,
                type: "info",
                rule: "semicolon",
                message: "Possibly missing semicolon",
                original: trimmed,
            });
        }

        // 6. console.log in production code
        if (/console\.log\s*\(/.test(trimmed)) {
            issues.push({
                line: lineNum,
                type: "info",
                rule: "no-console",
                message: "Avoid console.log in production — use a proper logger",
                original: trimmed,
            });
        }
    });

    // 7. No error handling
    if (!/try\s*\{/.test(code)) {
        issues.push({
            line: 0,
            type: "warning",
            rule: "error-handling",
            message: "No error handling found — consider adding try/catch blocks",
            original: "(entire code)",
        });
    }

    // ── Calculate score ──

    const warnings = issues.filter((i) => i.type === "warning").length;
    const infos = issues.filter((i) => i.type === "info").length;
    const errors = issues.filter((i) => i.type === "error").length;

    // Deductions: errors=2pts, warnings=1pt, infos=0.5pt
    const deductions = errors * 2 + warnings * 1 + infos * 0.5;
    const score = Math.max(0, Math.min(10, Math.round(10 - deductions)));

    // ── Letter grade ──

    let grade;
    if (score >= 9) grade = "A";
    else if (score >= 7) grade = "B";
    else if (score >= 5) grade = "C";
    else if (score >= 3) grade = "D";
    else grade = "F";

    // ── Build suggestions ──

    const suggestions = [];
    const rules = new Set(issues.map((i) => i.rule));

    if (rules.has("no-var")) {
        suggestions.push("Replace all 'var' declarations with 'const' or 'let' for block scoping.");
    }
    if (rules.has("strict-equality")) {
        suggestions.push("Use strict equality (===) to avoid unexpected type coercion bugs.");
    }
    if (rules.has("type-check")) {
        suggestions.push("Add type checks (typeof) at the start of functions to validate inputs.");
    }
    if (rules.has("error-handling")) {
        suggestions.push("Wrap risky operations in try/catch blocks to handle errors gracefully.");
    }
    if (rules.has("formatting")) {
        suggestions.push("Break one-liner functions into multiple lines for better readability.");
    }
    if (rules.has("semicolon")) {
        suggestions.push("Add semicolons at the end of statements for consistency.");
    }
    if (rules.has("no-console")) {
        suggestions.push("Replace console.log with a logging library for production use.");
    }
    if (suggestions.length === 0) {
        suggestions.push("Code looks great! Keep following best practices.");
    }

    return { issues, score, grade, suggestions };
}

module.exports = { review };
