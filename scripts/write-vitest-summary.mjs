import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";

const reports = [
  {
    label: "Unit Tests",
    path: "reports/vitest-unit.json",
  },
  {
    label: "Integration Tests",
    path: "reports/vitest-integration.json",
  },
];

const statusIcon = {
  failed: "FAIL",
  passed: "PASS",
  pending: "SKIP",
  skipped: "SKIP",
  todo: "TODO",
};

const escapeCell = (value) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");

const formatDuration = (duration) => {
  if (typeof duration !== "number") {
    return "";
  }

  if (duration < 1000) {
    return `${Math.round(duration)} ms`;
  }

  return `${(duration / 1000).toFixed(2)} s`;
};

const readReport = (path) => {
  if (!existsSync(path)) {
    return;
  }

  return JSON.parse(readFileSync(path, "utf8"));
};

const summarizeReport = ({ label, path }) => {
  const report = readReport(path);

  if (!report) {
    return `## ${label}\n\n_Not executed in this workflow run._\n`;
  }

  const fileResults = report.testResults ?? [];
  const passedFiles = fileResults.filter(
    (result) => result.status === "passed"
  );
  const failedFiles = fileResults.filter(
    (result) => result.status === "failed"
  );
  const lines = [
    `## ${label}`,
    "",
    `**Result:** ${report.success ? "Passed" : "Failed"}`,
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Test files | ${fileResults.length} |`,
    `| Passed files | ${passedFiles.length} |`,
    `| Failed files | ${failedFiles.length} |`,
    `| Tests | ${report.numTotalTests} |`,
    `| Passed | ${report.numPassedTests} |`,
    `| Failed | ${report.numFailedTests} |`,
    `| Skipped | ${report.numPendingTests} |`,
    "",
    "| Status | File | Test | Duration |",
    "| --- | --- | --- | ---: |",
  ];

  for (const fileResult of fileResults) {
    const fileName = relative(process.cwd(), fileResult.name).replaceAll(
      "\\",
      "/"
    );

    for (const testResult of fileResult.assertionResults ?? []) {
      const icon = statusIcon[testResult.status] ?? testResult.status;
      lines.push(
        `| ${icon} | ${escapeCell(fileName)} | ${escapeCell(testResult.fullName)} | ${formatDuration(testResult.duration)} |`
      );
    }
  }

  return `${lines.join("\n")}\n`;
};

const summary = [
  "# Vitest Test Report",
  "",
  ...reports.map((report) => summarizeReport(report)),
].join("\n");

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
} else {
  console.info(summary);
}
