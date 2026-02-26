// fix-agent.js - Accepts code and returns an improved version
// Usage: const { fix } = require("./fix-agent");
//        const fixedCode = fix(codeString);

/**
 * Takes a code string and returns an improved version with:
 *  - Type validation added to functions
 *  - Better formatting (expanded one-liners, semicolons)
 *  - Simple error handling (try/catch)
 * @param {string} code - The source code to fix
 * @returns {string} The improved code
 */
function fix(code) {
    const lines = code.split("\n");
    const fixed = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines and comments — keep as-is
        if (trimmed.length === 0 || trimmed.startsWith("//")) {
            fixed.push(line);
            continue;
        }

        // --- Fix 'var' → 'const' ---
        line = line.replace(/\bvar\b/g, "const");

        // --- Fix '==' → '===' ---
        line = line.replace(/([^=!])={2}([^=])/g, "$1===$2");

        // --- Add semicolons where missing ---
        const t = line.trim();
        if (
            t.length > 0 &&
            !t.endsWith(";") &&
            !t.endsWith("{") &&
            !t.endsWith("}") &&
            !t.startsWith("//") &&
            !t.startsWith("if") &&
            !t.startsWith("else") &&
            !t.startsWith("function") &&
            !t.startsWith("try") &&
            !t.startsWith("catch") &&
            /[\w)"']$/.test(t)
        ) {
            line = line.replace(/\s*$/, ";");
        }

        // --- Expand one-liner functions + add type validation ---
        const funcMatch = line.match(
            /^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{\s*return\s+(.*)\s*\}$/
        );
        if (funcMatch) {
            const [, indent, name, params, body] = funcMatch;
            const paramList = params.split(",").map((p) => p.trim());

            fixed.push(`${indent}function ${name}(${paramList.join(", ")}) {`);

            // Add type checks for each parameter
            paramList.forEach((param) => {
                fixed.push(`${indent}  if (typeof ${param} !== "number") {`);
                fixed.push(`${indent}    throw new Error("${name}(): '${param}' must be a number, got " + typeof ${param});`);
                fixed.push(`${indent}  }`);
            });

            fixed.push(``);
            fixed.push(`${indent}  return ${body};`);
            fixed.push(`${indent}}`);
            continue;
        }

        // --- Wrap standalone function calls in try/catch ---
        const callMatch = t.match(/^(\w+)\s*\(.*\);?$/);
        if (callMatch && !t.startsWith("console")) {
            const indent = line.match(/^(\s*)/)[1];
            fixed.push(`${indent}try {`);
            fixed.push(`${indent}  ${t.endsWith(";") ? t : t + ";"}`);
            fixed.push(`${indent}} catch (err) {`);
            fixed.push(`${indent}  console.error("Error:", err.message);`);
            fixed.push(`${indent}}`);
            continue;
        }

        fixed.push(line);
    }

    return fixed.join("\n");
}

module.exports = { fix };
