// pipeline.js - Auto-scans server folder and reviews all code files
// Usage: node scripts/pipeline.js

const fs = require("fs");
const path = require("path");
const { review } = require("./review-agent");
const { fix } = require("./fix-agent");

// ── Helpers ──────────────────────────────────────────────

const W = 56;
const LINE = "=".repeat(W);
const THIN = "─".repeat(W);

function heading(text) {
    const pad = Math.max(0, Math.floor((W - text.length) / 2));
    console.log(`\n${LINE}`);
    console.log(`${" ".repeat(pad)}${text}`);
    console.log(`${LINE}\n`);
}

function label(text) {
    console.log(`\n=== ${text} ===\n`);
}

function scoreBar(score, max) {
    const filled = Math.round((score / max) * 20);
    const empty = 20 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
}

function gradeColor(grade) {
    const colors = { A: "🟢", B: "🔵", C: "🟡", D: "🟠", F: "🔴" };
    return colors[grade] || "⚪";
}

// ── Scan for files ───────────────────────────────────────

function getFiles(dir, extensions) {
    let results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        if (item === "node_modules" || item === ".git" || item === "prisma") {
            continue;
        }

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

const extensions = [".js", ".ts", ".tsx", ".jsx"];
const dirs = ["server", "client/src"];

// Scan all directories and combine results
let files = [];
for (const dir of dirs) {
    const fullDir = path.resolve(dir);
    if (fs.existsSync(fullDir)) {
        files = files.concat(getFiles(fullDir, extensions));
    }
}

// ── Pipeline Start ───────────────────────────────────────

heading("🤖  AI CODE REVIEW PIPELINE  🤖");

console.log(`  📁 Scanning  : ${dirs.join(", ")}`);
console.log(`  📄 Files     : ${files.length} found (${extensions.join(", ")})`);
console.log(`  🕐 Started   : ${new Date().toLocaleString()}`);
console.log(`\n${THIN}`);

let totalIssues = 0;
let totalScore = 0;
let filesWithIssues = 0;
let cleanFiles = 0;

// ── Loop through each file ───────────────────────────────

files.forEach((filePath, index) => {
    const relativePath = path.relative(".", filePath);
    const code = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
    const lineCount = code.split("\n").length;

    // ── File heading ──

    label(`Checking File: ${relativePath}`);

    console.log(`  📄 File  : ${path.basename(filePath)}`);
    console.log(`  📂 Path  : ${relativePath}`);
    console.log(`  📏 Lines : ${lineCount}`);
    console.log(`  🔢 #     : ${index + 1} of ${files.length}`);

    // ── Review ──

    label("AI REVIEW");

    const result = review(code);
    const { issues, score, grade, suggestions } = result;

    totalScore += score;

    if (issues.length === 0) {
        console.log(`  ✅ No issues found — this file is clean!`);
        console.log(`  📊 Score : ${scoreBar(10, 10)}  10/10`);
        console.log(`  🎓 Grade : ${gradeColor("A")} A\n`);
        cleanFiles++;
        console.log(THIN);
        return;
    }

    filesWithIssues++;
    totalIssues += issues.length;

    console.log(`  ⚠️  ${issues.length} issue(s) detected:\n`);

    const icons = { error: "❌", warning: "⚠️ ", info: "ℹ️ " };

    issues.forEach((issue, i) => {
        const icon = icons[issue.type] || "•";
        const tag = issue.type.toUpperCase().padEnd(7);
        const loc = issue.line > 0 ? `Line ${issue.line}` : "General";
        console.log(`   ${String(i + 1).padStart(2)}. ${icon} [${tag}]  ${loc}`);
        console.log(`       ${issue.message}`);
        console.log(`       └─ ${issue.original}\n`);
    });

    // Score + Grade
    console.log(`  📊 Score : ${scoreBar(score, 10)}  ${score}/10`);
    console.log(`  🎓 Grade : ${gradeColor(grade)} ${grade}`);

    // Suggestions
    label("💡 SUGGESTIONS");

    suggestions.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s}`);
    });

    // ── Fix ──

    label("AI FIX");

    console.log("  Generating improved code...\n");
    console.log(THIN);

    const fixedCode = fix(code);
    console.log(fixedCode);

    console.log(THIN);
    console.log("\n  ✅ Fixes applied successfully.\n");
    console.log(THIN);
});

// ── Final Summary ────────────────────────────────────────

heading("📊  FINAL SUMMARY");

const avgScore = files.length > 0 ? Math.round(totalScore / files.length) : 10;
let overallGrade;
if (avgScore >= 9) overallGrade = "A";
else if (avgScore >= 7) overallGrade = "B";
else if (avgScore >= 5) overallGrade = "C";
else if (avgScore >= 3) overallGrade = "D";
else overallGrade = "F";

console.log(`  📁 Total files scanned  : ${files.length}`);
console.log(`  ✅ Clean files           : ${cleanFiles}`);
console.log(`  ⚠️  Files with issues     : ${filesWithIssues}`);
console.log(`  🐛 Total issues found   : ${totalIssues}`);
console.log(`\n  📊 Overall : ${scoreBar(avgScore, 10)}  ${avgScore}/10`);
console.log(`  🎓 Grade   : ${gradeColor(overallGrade)} ${overallGrade}`);

const verdict =
    avgScore >= 8
        ? "🟢 Excellent — project is in great shape!"
        : avgScore >= 5
            ? "🟡 Fair — some files need attention."
            : "🔴 Poor — several files need improvements.";
console.log(`  🏷️  Verdict : ${verdict}`);

heading("✅  PIPELINE COMPLETE");

console.log("  Thank you for using AI Code Review Pipeline.");
console.log("  Run again anytime:\n");
console.log("    npm run ai-check\n");
