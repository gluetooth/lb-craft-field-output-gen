# Craft CMS Field Snippet Tool
## Script which takes the JSON exported from Field Manager and outputs useful snippets. 

### Features
- Parses **all core Craft CMS 5 field types**
- Outputs 
    - Summary of field names, labels and types
    - **formatted Twig + HTML**
- Handles **Matrix fields** with subfield rendering
- Adds useful fallback comments and conditions
- Output formatted with **Prettier**

### Quickstart

#### Clone the repo
```
git clone https://github.com/gluetooth/craft-twig-generator.git
cd craft-twig-generator
```
#### Install dependencies
```
npm install
```
#### Run the tool
```
npm start
```
### Follow the prompts

1. Enter your file name (e.g. field-export.json)
2. Confirm generation
3. Done! (The HTML/Twig snippets will be saved to output.twig)

---
### Dependencies

Node.js v16+

```
npm install inquirer chalk prettier
```
- inquirer → for prompts
- chalk → for terminal colors
- prettier → for formatting Twig output

Ensure the package.json includes:

```
{
  "type": "module"
}
```

### Place your Craft field export JSON file in the same folder.

- field-export.json
- craft-field-to-Twig.js

### Run the tool

```
node craft-field-to-Twig.js
```

### Follow the prompts

1. Enter your file name (e.g. field-export.json)
2. Confirm generation
3. Done! (The HTML/Twig snippets will be saved to output.Twig)