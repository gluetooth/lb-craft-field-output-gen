# Craft CMS Field Snippet Tool
## Script which takes the JSON exported from Field Manager and outputs useful snippets. 

### Features
- Parses **all core Craft CMS 5 field types**
- Outputs **formatted Liquid + HTML**
- Handles **Matrix fields** with subfield rendering
- Adds useful fallback comments and conditions
- Output formatted with **Prettier**

### Dependencies

Node.js v16+

npm install inquirer chalk prettier

inquirer → for prompts
chalk → for terminal colors
prettier → for formatting Liquid output

Ensure the package.json includes:

{
  "type": "module"
}

### Place your Craft field export JSON file in the same folder.

field-export.json
craft-field-to-liquid.js

### Run the tool

node craft-field-to-liquid.js

### Follow the prompts

1. Enter your file name (e.g. field-export.json)
2. Confirm generation
3. Done! (The HTML/Liquid snippets will be saved to output.liquid)