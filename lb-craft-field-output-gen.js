#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import chalk from "chalk";
import prettier from "prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFieldTypeName(type) {
  const map = {
    "craft\\fields\\PlainText": "Plain Text",
    "craft\\fields\\Assets": "Assets",
    "craft\\ckeditor\\Field": "Rich Text",
    "craft\\fields\\Number": "Number",
    "craft\\fields\\Email": "Email",
    "craft\\fields\\Link": "Link",
    "craft\\fields\\Url": "URL",
    "craft\\fields\\Entries": "Entries",
    "craft\\fields\\Users": "Users",
    "craft\\fields\\Categories": "Categories",
    "craft\\fields\\Tags": "Tags",
    "craft\\fields\\Checkboxes": "Checkboxes",
    "craft\\fields\\Dropdown": "Dropdown",
    "craft\\fields\\MultiSelect": "Multi-select",
    "craft\\fields\\RadioButtons": "Radio Buttons",
    "craft\\fields\\Date": "Date/Time",
    "craft\\fields\\Color": "Color",
    "craft\\fields\\Money": "Money",
    "craft\\fields\\Table": "Table",
    "craft\\fields\\Lightswitch": "Lightswitch",
    "craft\\fields\\Matrix": "Matrix",
    "ether\\seo\\fields\\SeoField": "SEO"
  };
  return map[type] || type;
}

function renderSubfield(handle, type, fieldObject = null) {
  switch (type) {
    case "craft\\fields\\PlainText":
    case "craft\\fields\\Number":
    case "craft\\fields\\Url":
    case "craft\\fields\\Color":
      return `    {% if block.${handle} %}
      <p>{{ block.${handle} }}</p>
    {% endif %}`;

    case "craft\\ckeditor\\Field":
      return `    {% if block.${handle} %}
      {{ block.${handle}|raw }}
    {% endif %}`;

    case "craft\\fields\\Assets":
      return `    {% if block.${handle}|length %}
      {% for asset in block.${handle} %}
        <img src="{{ asset.url }}" alt="{{ asset.title }}">
      {% endfor %}
    {% endif %}`;

    case "craft\\fields\\Lightswitch":
      return `    {% if block.${handle} %}
      <!-- ON -->
    {% else %}
      <!-- OFF -->
    {% endif %}`;

    case "craft\\fields\\Entries":
    case "craft\\fields\\Users":
    case "craft\\fields\\Categories":
    case "craft\\fields\\Tags":
      return `    {% if block.${handle}|length %}
      <ul>
        {% for item in block.${handle} %}
          <li>{{ item.title }}</li>
        {% endfor %}
      </ul>
    {% endif %}`;

    case "craft\\fields\\Matrix":
      if (fieldObject) {
        // Handle nested matrix
        const nestedMatrixField = {
          ...fieldObject,
          handle: `block.${handle}`
        };
        const matrixOutput = generateMatrixSnippet(nestedMatrixField);
        return matrixOutput.replace(/entry\./g, ""); // Remove "entry." for nested blocks
      } else {
        return `<!-- Matrix field '${handle}' detected but structure unknown -->`;
      }

    default:
      return `    {{ block.${handle} }}`;
  }
}

function generateMatrixSnippet(field) {
  const h = field.handle;
  const blocks = field.settings?.entryTypes || [];

  const snippets = blocks.map((block) => {
    const blockHandle = block.handle;
    const elements =
      block.fieldLayout?.tabs?.flatMap((tab) => tab.elements) || [];

    const fields = elements
      .filter(
        (el) =>
          el.type === "craft\\fieldlayoutelements\\CustomField" &&
          el.fieldUid &&
          el.handle
      )
      .map((el) => renderSubfield(el.handle, el.fieldType, el));

    return `
  {% if block.type == '${blockHandle}' %}
    <!-- Block: ${block.name} (${blockHandle}) -->
${fields.join("\n")}
  {% endif %}`;
  });

  return `{% for block in ${h} %}${snippets.join("\n")}
{% endfor %}`;
}

function generateSnippet(field) {
  const h = field.handle;
  const type = field.type;

  switch (type) {
    case "craft\\fields\\PlainText":
    case "craft\\fields\\Number":
    case "craft\\fields\\Color":
    case "craft\\fields\\Url":
      return `{% if entry.${h} %}
  <p>{{ entry.${h} }}</p>
{% endif %}`;

    case "craft\\fields\\Email":
      return `{% if entry.${h} %}
  <a href="mailto:{{ entry.${h} }}">{{ entry.${h} }}</a>
{% endif %}`;

    case "craft\\fields\\Assets":
      return `{% if entry.${h}|length %}
  {% for asset in entry.${h} %}
    <img src="{{ asset.url }}" alt="{{ asset.title }}">
  {% endfor %}
{% endif %}`;

    case "craft\\fields\\Entries":
    case "craft\\fields\\Users":
    case "craft\\fields\\Categories":
    case "craft\\fields\\Tags":
      return `{% if entry.${h}|length %}
  <ul>
    {% for item in entry.${h} %}
      <li>{{ item.title }}</li>
    {% endfor %}
  </ul>
{% endif %}`;

    case "craft\\fields\\Checkboxes":
    case "craft\\fields\\MultiSelect":
      return `{% if entry.${h}|length %}
  <ul>
    {% for option in entry.${h} %}
      <li>{{ option }}</li>
    {% endfor %}
  </ul>
{% endif %}`;

    case "craft\\fields\\Dropdown":
    case "craft\\fields\\RadioButtons":
      return `{% if entry.${h} %}
  <p>{{ entry.${h} }}</p>
{% endif %}`;

    case "craft\\fields\\Date":
      return `{% if entry.${h} %}
  <time datetime="{{ entry.${h}|date('c') }}">{{ entry.${h}|date('F j, Y') }}</time>
{% endif %}`;

    case "craft\\ckeditor\\Field":
      return `{% if entry.${h} %}
  {{ entry.${h}|raw }}
{% endif %}`;

    case "craft\\fields\\Lightswitch":
      return `{% if entry.${h} %}
  <!-- ON -->
{% else %}
  <!-- OFF -->
{% endif %}`;

    case "craft\\fields\\Money":
      return `{% if entry.${h} %}
  {{ entry.${h}.currency }} {{ entry.${h}.amount }}
{% endif %}`;

    case "craft\\fields\\Table":
      return `{% if entry.${h}|length %}
  <table>
    <thead>
      <tr>
        {% for heading in entry.${h}[0]|keys %}
          <th>{{ heading }}</th>
        {% endfor %}
      </tr>
    </thead>
    <tbody>
      {% for row in entry.${h} %}
        <tr>
          {% for cell in row %}
            <td>{{ cell }}</td>
          {% endfor %}
        </tr>
      {% endfor %}
    </tbody>
  </table>
{% endif %}`;

    case "craft\\fields\\Matrix":
      return generateMatrixSnippet(field);

    case "ether\\seo\\fields\\SeoField":
      return `<title>{{ entry.${h}.title }}</title>
<meta name="description" content="{{ entry.${h}.description }}">`;

    default:
      return `<!-- Unknown field type: ${type} -->`;
  }
}

async function main() {
  console.log(chalk.bold.cyan("\n🧠 Craft Field → Twig Generator\n"));

  const { filePath } = await inquirer.prompt([
    {
      type: "input",
      name: "filePath",
      message: "Path to exported Craft JSON file:",
      validate: (input) => fs.existsSync(input) || "❌ File not found."
    }
  ]);

  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

  console.log(chalk.yellow("\n📋 Fields Found:\n"));
  json.forEach((f, i) => {
    console.log(
      chalk.green(`${i + 1}. ${f.name}`) +
        ` (${chalk.gray(f.handle)}) - ${getFieldTypeName(f.type)}`
    );
  });

  const { generate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "generate",
      message: "\nGenerate Twig + HTML snippets?",
      default: true
    }
  ]);

  if (!generate) {
    console.log(chalk.gray("\nAborted. No code generated.\n"));
    return;
  }

  const rawOutput = json
    .map((f) => `<!-- ${f.name} (${f.handle}) -->\n` + generateSnippet(f))
    .join("\n\n");

  const formatted = await prettier.format(rawOutput, { parser: "html" });

  const outPath = path.join(process.cwd(), "output.twig");

  fs.writeFileSync(outPath, formatted, "utf8");
  console.log(chalk.blue(`\n✅ Twig snippets saved to: ${chalk.underline(outPath)}\n`));
}

main();