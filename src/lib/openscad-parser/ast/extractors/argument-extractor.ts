import { TSNode } from '../utils/location-utils';
import * as ast from '../ast-types';
import { extractValue } from './value-extractor';

/**
 * Extract arguments from a module instantiation
 */
export function extractArguments(argumentList: TSNode): ast.Parameter[] {
  const args: ast.Parameter[] = [];
  console.log(`[extractArguments] Processing argument_list: ${argumentList.text.substring(0,40)}, children count: ${argumentList.childCount}, namedChildren count: ${argumentList.namedChildCount}`); // DEBUG

  // First, check if we have an 'arguments' node as a child
  const argumentsNode = argumentList.children.find(child => child?.type === 'arguments');
  if (argumentsNode) {
    console.log(`[extractArguments] Found 'arguments' node: ${argumentsNode.text.substring(0,30)}`); // DEBUG
    // Process the arguments node's children
    for (let i = 0; i < argumentsNode.childCount; i++) {
      const argNode = argumentsNode.child(i);
      if (!argNode) continue;
      
      console.log(`[extractArguments] Processing argument node: type='${argNode.type}', text='${argNode.text.substring(0,30)}'`); // DEBUG
      
      if (argNode.type === 'argument') {
        // Check if this is a named argument (has identifier and '=' as children)
        const identifierNode = argNode.children.find(child => child?.type === 'identifier');
        const equalsNode = argNode.children.find(child => child?.type === '=');
        
        if (identifierNode && equalsNode) {
          // This is a named argument
          const name = identifierNode.text;
          // The value is after the '=' sign
          const valueNode = argNode.children[argNode.children.indexOf(equalsNode) + 1];
          if (valueNode) {
            const value = extractValue(valueNode);
            console.log(`[extractArguments] Extracted named arg: name='${name}', value='${JSON.stringify(value)}'`); // DEBUG
            if (value !== undefined) {
              args.push({ name, value });
            }
          }
        } else {
          // This is a positional argument
          // The value is the first expression child
          const expressionNode = argNode.children.find(child => 
            child?.type === 'expression' || 
            child?.type === 'array_literal' ||
            child?.type === 'number' ||
            child?.type === 'string_literal' ||
            child?.type === 'boolean' ||
            child?.type === 'identifier'
          );
          
          if (expressionNode) {
            const value = extractValue(expressionNode);
            console.log(`[extractArguments] Extracted positional arg: value='${JSON.stringify(value)}'`); // DEBUG
            if (value !== undefined) {
              args.push({ value });
            }
          }
        }
      } else if (argNode.type === ',') {
        // Skip commas
        continue;
      } else {
        console.log(`[extractArguments] Skipping argument node of type: ${argNode.type}`); // DEBUG
      }
    }
  } else {
    // Fall back to the old method if no 'arguments' node is found
    for (const childNode of argumentList.children) { 
      if (!childNode) continue; // Added null check for childNode
      console.log(`[extractArguments] Child of argument_list: type='${childNode.type}', text='${childNode.text.substring(0,20)}'`); // DEBUG
      
      if (childNode.type === 'named_argument') {
        const nameNode = childNode.childForFieldName('name'); 
        const valueNode = childNode.childForFieldName('value');
        console.log(`[extractArguments]   Named argument: nameNode type='${nameNode?.type}', valueNode type='${valueNode?.type}'`); // DEBUG
        if (nameNode && valueNode) {
          const name = nameNode.text;
          const value = extractValue(valueNode);
          console.log(`[extractArguments]     Extracted named arg: name='${name}', value='${JSON.stringify(value)}'`); // DEBUG
          if (value !== undefined) {
            args.push({ name, value });
          }
        }
      } else if (childNode.type === 'expression' || 
                 childNode.type === 'number' || 
                 childNode.type === 'string_literal' ||
                 childNode.type === 'array_literal' ||
                 childNode.type === 'identifier' ||
                 childNode.type === 'boolean' // Added boolean as it's a valid value
                ) { 
        console.log(`[extractArguments]   Positional argument candidate: type='${childNode.type}', text='${childNode.text.substring(0,20)}'`); // DEBUG
        const value = extractValue(childNode);
        console.log(`[extractArguments]     Extracted positional value: '${JSON.stringify(value)}'`); // DEBUG
        if (value !== undefined) { 
          args.push({ value }); 
        }
      } else {
        console.log(`[extractArguments]   Ignoring child of argument_list: type='${childNode.type}'`); // DEBUG
      }
    }
  }
  
  console.log(`[extractArguments] Extracted args: ${JSON.stringify(args)}`); // DEBUG
  return args;
}
