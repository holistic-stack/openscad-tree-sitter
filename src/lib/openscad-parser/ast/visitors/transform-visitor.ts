import { Node as TSNode } from 'web-tree-sitter';
import * as ast from '../ast-types';
import { BaseASTVisitor } from './base-ast-visitor';
import { extractArguments } from '../extractors/argument-extractor';
import { getLocation } from '../utils/location-utils';

// Define types for what extractArguments returns
interface ExtractedNamedArgument {
  name: string;
  value: ast.Value;
}
type ExtractedParameter = ExtractedNamedArgument | ast.Value;

export class TransformVisitor extends BaseASTVisitor {
  constructor(source: string) {
    super(source);
  }

  public visitModuleInstantiation = (node: TSNode): ast.ASTNode | null => {
    process.stdout.write(`[TransformVisitor.visitModuleInstantiation] Processing node type: ${node.type}\n`);
    const nameFieldNode = node.childForFieldName('name');
    if (!nameFieldNode) {
      process.stdout.write('[TransformVisitor.visitModuleInstantiation] Name field node not found\n');
      return null;
    }

    const functionName = nameFieldNode.text;
    const argsNode = node.childForFieldName('arguments');
    const args: ExtractedParameter[] = argsNode ? extractArguments(argsNode) : [];

    const processedChildren: ast.ASTNode[] = [];
    const blockNode = node.childForFieldName('body');
    if (blockNode) {
      const childrenNodesToProcess = blockNode.type === 'statement_block' ? blockNode.children : [blockNode];
      childrenNodesToProcess.forEach(childNode => {
        if (childNode) {
          const visitedChild = this.visitNode(childNode);
          if (visitedChild) {
            processedChildren.push(visitedChild);
          }
        }
      });
    }
    
    process.stdout.write(`[TransformVisitor.visitModuleInstantiation] Function: ${functionName}, Args: ${JSON.stringify(args)}, Children count: ${processedChildren.length}\n`);
    const astNode = this.createASTNodeForFunction(node, functionName, args);

    if (astNode && 'children' in astNode && Array.isArray((astNode as any).children)) {
      (astNode as any).children.push(...processedChildren);
    }

    return astNode;
  };

  protected createASTNodeForFunction(
    moduleInstantiationNode: TSNode,
    functionName: string,
    args: ExtractedParameter[],
  ): ast.ASTNode | null {
    process.stdout.write(`[TransformVisitor.createASTNodeForFunction] Creating AST node for function: ${functionName}\n`);
    let specificNode: ast.ASTNode | null = null;
    switch (functionName) {
      case 'translate':
        specificNode = this.createTranslateNode(moduleInstantiationNode, args, []);
        break;
      case 'rotate':
        specificNode = this.createRotateNode(moduleInstantiationNode, args, []);
        break;
      case 'scale':
        specificNode = this.createScaleNode(moduleInstantiationNode, args, []);
        break;
      case 'mirror':
        specificNode = this.createMirrorNode(moduleInstantiationNode, args, []);
        break;
      case 'multmatrix':
        specificNode = this.createMultmatrixNode(moduleInstantiationNode, args, []);
        break;
      case 'color':
        specificNode = this.createColorNode(moduleInstantiationNode, args, []);
        break;
      default:
        process.stdout.write(`[TransformVisitor.createASTNodeForFunction] Unknown transformation or color function: ${functionName}\n`);
        // For unknown functions, we create a generic ModuleInstantiationNode
        // We need to convert ExtractedParameter[] back to ast.Parameter[] for this generic node
        const astParameters: ast.Parameter[] = args.map(arg => {
          if (this.isExtractedNamedArgument(arg)) {
            // This conversion is tricky because ast.ParameterValue is not ast.Value
            // For simplicity, we'll try to pass the raw value if it's a primitive, or stringify for now
            // This part might need more robust conversion depending on how generic instantiations are used
            let paramValue: ast.ParameterValue;
            if (arg.value.type === 'number') paramValue = parseFloat(arg.value.value as string);
            else if (arg.value.type === 'string') paramValue = arg.value.value as string;
            else if (arg.value.type === 'boolean') paramValue = (arg.value.value as string).toLowerCase() === 'true';
            else paramValue = JSON.stringify(arg.value); // Fallback
            return { name: arg.name, value: paramValue };
          }
          // For unnamed ast.Value, it's harder to map directly to ast.ParameterValue without context
          // For now, stringify. This needs refinement.
          return { value: JSON.stringify(arg) }; 
        });
        return {
          type: 'module_instantiation',
          name: functionName,
          arguments: astParameters, // This now uses the converted ast.Parameter[]
          children: [], // Children are handled by the caller
          location: getLocation(moduleInstantiationNode)
        };
    }
    return specificNode;
  }

  // Type guard to check if a parameter is a named argument
  private isExtractedNamedArgument(param: ExtractedParameter): param is ExtractedNamedArgument {
    return typeof (param as ExtractedNamedArgument).name === 'string';
  }

  // Type guard to check if a parameter is a direct ast.Value (unnamed argument)
  // This is essentially the case where it's not an ExtractedNamedArgument
  private isExtractedValue(param: ExtractedParameter): param is ast.Value {
    return typeof (param as ExtractedNamedArgument).name === 'undefined' && (param as ast.Value).type !== undefined;
  }

  private createTranslateNode(transformCstNode: TSNode, args: ExtractedParameter[], children: ast.ASTNode[]): ast.TranslateNode | null {
    console.log('[TransformVisitor.createTranslateNode] Received args:', JSON.stringify(args, null, 2));
    
    // Default vector for the TranslateNode (will be number[])
    let finalVector: ast.Vector3D = [0, 0, 0];

    if (args.length > 0) {
      const firstArg = args[0];
      console.log('[TransformVisitor.createTranslateNode] Processing firstArg:', JSON.stringify(firstArg, null, 2));
      console.log(`[TransformVisitor.createTranslateNode] isExtractedNamedArgument(firstArg): ${this.isExtractedNamedArgument(firstArg)}`);
      console.log(`[TransformVisitor.createTranslateNode] isExtractedValue(firstArg): ${this.isExtractedValue(firstArg)}`);

      let argValueToProcess: ast.Value | undefined = undefined;

      if (this.isExtractedNamedArgument(firstArg) && firstArg.name === 'v') {
        console.log('[TransformVisitor.createTranslateNode] Detected named argument \'v\'');
        argValueToProcess = firstArg.value;
      } else if (this.isExtractedValue(firstArg)) {
        console.log(`[TransformVisitor.createTranslateNode] Detected unnamed argument (ast.Value)`);
        argValueToProcess = firstArg;
      } else if (args.length <= 3 && args.every(arg => this.isExtractedValue(arg) && (arg as ast.Value).type === 'number')){
        console.log('[TransformVisitor.createTranslateNode] Detected multiple individual number arguments.');
        const numValues = args.map(arg => parseFloat(((arg as ast.Value).value as string)));
        finalVector = [
          numValues[0] !== undefined && !isNaN(numValues[0]) ? numValues[0] : 0,
          numValues[1] !== undefined && !isNaN(numValues[1]) ? numValues[1] : 0,
          numValues[2] !== undefined && !isNaN(numValues[2]) ? numValues[2] : 0,
        ];
        argValueToProcess = undefined; // Handled directly
      } else {
        console.warn('[TransformVisitor.createTranslateNode] Arguments do not match expected patterns for translate. First arg:', JSON.stringify(firstArg));
      }

      if (argValueToProcess) {
        if (argValueToProcess.type === 'vector') {
          const vectorComponents = argValueToProcess.value as ast.Value[]; // value is Value[] for type 'vector'
          const numbers = vectorComponents.map(comp => {
            if (comp.type === 'number') {
              return parseFloat(comp.value as string); // comp.value is string for type 'number'
            }
            return NaN; // Or some other indicator of a non-number component
          }).filter(n => !isNaN(n));

          if (numbers.length === 1) finalVector = [numbers[0], 0, 0];
          else if (numbers.length === 2) finalVector = [numbers[0], numbers[1], 0] as ast.Vector2D; // Cast to Vector2D for type safety if needed by ast.TranslateNode
          else if (numbers.length >= 3) finalVector = [numbers[0], numbers[1], numbers[2]];
          
          console.log('[TransformVisitor.createTranslateNode] Assigned vector from processed arg:', JSON.stringify(finalVector));
        } else if (argValueToProcess.type === 'number') {
          const numVal = parseFloat(argValueToProcess.value as string);
          if (!isNaN(numVal)) {
            finalVector = [numVal, 0, 0];
            console.log('[TransformVisitor.createTranslateNode] Created vector from single number arg:', JSON.stringify(finalVector));
          }
        } else {
          console.warn('[TransformVisitor.createTranslateNode] Argument value is not a vector or number. Type:', argValueToProcess.type);
        }
      }
    } else {
      console.log('[TransformVisitor.createTranslateNode] No arguments provided, using default vector.');
    }

    console.log('[TransformVisitor.createTranslateNode] Final vector for node:', JSON.stringify(finalVector));

    try {
      const nodeLocation = getLocation(transformCstNode);
      return {
        type: 'translate',
        v: finalVector, 
        children: children,
        location: nodeLocation,
      };
    } catch (e: any) {
      process.stdout.write(`[TransformVisitor.createTranslateNode] Error in getLocation: ${e.message}\n`);
      return {
        type: 'translate',
        v: finalVector, 
        children: children,
        location: { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } },
      };
    }
  }

  private createRotateNode(transformCstNode: TSNode, args: ExtractedParameter[], children: ast.ASTNode[]): ast.RotateNode | null {
    process.stdout.write(`[TransformVisitor.createRotateNode] Creating rotate node with ${args.length} arguments\n`);
    const paramsMap = this.getParametersMap(args);
    let a: number | ast.Vector3D | undefined;
    let v: ast.Vector3D | undefined;
    let nodeLocation: ast.SourceLocation | undefined;

    try {
      nodeLocation = getLocation(transformCstNode);
    } catch (e: any) {
      process.stdout.write(`[TransformVisitor.createRotateNode] Error in getLocation: ${e.message}\n`);
      nodeLocation = { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }; 
    }

    const aParam = paramsMap.get('a');
    const vParam = paramsMap.get('v');

    if (aParam !== undefined) {
      if (Array.isArray(aParam) && (aParam.length === 3 || aParam.length === 1) && aParam.every(n => typeof n === 'number')) {
        a = aParam.length === 3 ? aParam as ast.Vector3D : aParam[0];
      } else if (typeof aParam === 'number') {
        a = aParam;
      } else if (this.isExtractedValue(aParam as ExtractedParameter)) { // Ensure it's ExtractedParameter
        const evaluatedVectorA = this.evaluateVectorExpression(aParam as ast.Value);
        if (evaluatedVectorA) {
          if (evaluatedVectorA.length === 3) a = evaluatedVectorA as ast.Vector3D;
          else if (evaluatedVectorA.length === 1) a = evaluatedVectorA[0]; // Assuming single number if not 3D vector
        }
      } else {
        process.stdout.write(`[TransformVisitor.createRotateNode] Parameter 'a' has unexpected type: ${typeof aParam}\n`);
      }
    }

    if (vParam !== undefined) {
      if (Array.isArray(vParam) && vParam.length === 3 && vParam.every(n => typeof n === 'number')) {
        v = vParam as ast.Vector3D;
      } else if (this.isExtractedValue(vParam as ExtractedParameter)) { // Ensure it's ExtractedParameter
        const evaluatedVectorV = this.evaluateVectorExpression(vParam as ast.Value);
        if (evaluatedVectorV && evaluatedVectorV.length === 3) {
          v = evaluatedVectorV as ast.Vector3D;
        }
      } else {
        process.stdout.write(`[TransformVisitor.createRotateNode] Parameter 'v' has unexpected type: ${typeof vParam}\n`);
      }
    }

    // Handle single unnamed argument case for 'a'
    if (a === undefined && v === undefined && args.length === 1 && !this.isExtractedNamedArgument(args[0])) {
      const singleArgVal = args[0] as ast.Value; // It must be an ast.Value here
      if (singleArgVal.type === 'number') {
        const numValue = parseFloat(singleArgVal.value as string);
        if(!isNaN(numValue)) a = numValue;
      } else if (singleArgVal.type === 'vector'){
        const vecValue = this.evaluateVectorExpression(singleArgVal);
        if(vecValue) {
            if (vecValue.length === 3) a = vecValue as ast.Vector3D;
            else if (vecValue.length === 1) a = vecValue[0];
        }
      }
    }

    if (a === undefined) {
      process.stdout.write(`[TransformVisitor.createRotateNode] Parameter 'a' is undefined, defaulting to 0.\n`);
      a = 0; 
    }

    process.stdout.write(`[TransformVisitor.createRotateNode] Created rotate node with a=${JSON.stringify(a)}, v=${JSON.stringify(v)}, children=${children.length}\n`);

    return {
      type: 'rotate',
      a: a, 
      v: v, 
      children: children,
      location: nodeLocation,
    };
  }

  private createScaleNode(transformCstNode: TSNode, args: ExtractedParameter[], children: ast.ASTNode[]): ast.ScaleNode | null {
    process.stdout.write(`[TransformVisitor.createScaleNode] Creating scale node with ${args.length} arguments\n`);
    const paramsMap = this.getParametersMap(args);
    let v: ast.Vector3D | undefined;
    let nodeLocation: ast.SourceLocation | undefined;

    try {
      nodeLocation = getLocation(transformCstNode);
    } catch (e: any) {
      process.stdout.write(`[TransformVisitor.createScaleNode] Error in getLocation: ${e.message}\n`);
      nodeLocation = { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }; 
    }

    const vParam = paramsMap.get('v');

    if (vParam !== undefined) {
      if (Array.isArray(vParam) && vParam.length === 3 && vParam.every(n => typeof n === 'number')) {
        v = vParam as ast.Vector3D;
      } else if (this.isExtractedValue(vParam as ExtractedParameter)) {
        const evaluatedVectorV = this.evaluateVectorExpression(vParam as ast.Value);
        if (evaluatedVectorV && evaluatedVectorV.length === 3) {
          v = evaluatedVectorV as ast.Vector3D;
        }
      }
    } else if (args.length === 1 && !this.isExtractedNamedArgument(args[0])) {
      const singleArgVal = args[0] as ast.Value;
      if (singleArgVal.type === 'vector') {
        const evaluatedVectorSingleArg = this.evaluateVectorExpression(singleArgVal);
        if (evaluatedVectorSingleArg && evaluatedVectorSingleArg.length === 3) {
          v = evaluatedVectorSingleArg as ast.Vector3D;
        }
      } else if (singleArgVal.type === 'number') { // Handle single number for uniform scaling
        const numVal = parseFloat(singleArgVal.value as string);
        if (!isNaN(numVal)) v = [numVal, numVal, numVal];
      }
    }

    if (v === undefined) {
      process.stdout.write(`[TransformVisitor.createScaleNode] Parameter 'v' is undefined or invalid, defaulting to [1,1,1].\n`);
      v = [1, 1, 1]; 
    }

    process.stdout.write(`[TransformVisitor.createScaleNode] Created scale node with v=${JSON.stringify(v)}, children=${children.length}\n`);

    return {
      type: 'scale',
      v: v, 
      children: children,
      location: nodeLocation,
    };
  }

  private createMirrorNode(transformCstNode: TSNode, args: ExtractedParameter[], children: ast.ASTNode[]): ast.MirrorNode | null {
    process.stdout.write(`[TransformVisitor.createMirrorNode] Creating mirror node with ${args.length} arguments\n`);
    const paramsMap = this.getParametersMap(args);
    let v: ast.Vector3D | undefined;
    let nodeLocation: ast.SourceLocation | undefined;

    try {
      nodeLocation = getLocation(transformCstNode);
    } catch (e: any) {
      process.stdout.write(`[TransformVisitor.createMirrorNode] Error in getLocation: ${e.message}\n`);
      nodeLocation = { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }; 
    }

    const vParam = paramsMap.get('v');

    if (vParam !== undefined) {
      if (Array.isArray(vParam) && vParam.length === 3 && vParam.every(n => typeof n === 'number')) {
        v = vParam as ast.Vector3D;
      } else if (this.isExtractedValue(vParam as ExtractedParameter)) {
        const evaluatedVectorV = this.evaluateVectorExpression(vParam as ast.Value);
        if (evaluatedVectorV && evaluatedVectorV.length === 3) {
          v = evaluatedVectorV as ast.Vector3D;
        }
      }
    } else if (args.length === 1 && !this.isExtractedNamedArgument(args[0])) {
      const singleArgVal = args[0] as ast.Value;
      if (singleArgVal.type === 'vector'){
        const evaluatedVectorSingleArg = this.evaluateVectorExpression(singleArgVal);
        if (evaluatedVectorSingleArg && evaluatedVectorSingleArg.length === 3) {
          v = evaluatedVectorSingleArg as ast.Vector3D;
        }
      }
    }

    if (v === undefined) {
      process.stdout.write(`[TransformVisitor.createMirrorNode] Parameter 'v' is undefined or invalid. Cannot create mirror node without a normal vector.\n`);
      return null; 
    }

    process.stdout.write(`[TransformVisitor.createMirrorNode] Created mirror node with v=${JSON.stringify(v)}, children=${children.length}\n`);

    return {
      type: 'mirror',
      v: v, 
      children: children,
      location: nodeLocation,
    };
  }

  private createMultmatrixNode(transformCstNode: TSNode, args: ExtractedParameter[], children: ast.ASTNode[]): ast.MultmatrixNode | null {
    process.stdout.write(`[TransformVisitor.createMultmatrixNode] Creating multmatrix node with ${args.length} arguments\n`);
    const paramsMap = this.getParametersMap(args);
    let m: number[][] | undefined;
    let nodeLocation: ast.SourceLocation | undefined;

    try {
      nodeLocation = getLocation(transformCstNode);
    } catch (e: any) {
      process.stdout.write(`[TransformVisitor.createMultmatrixNode] Error in getLocation: ${e.message}\n`);
      nodeLocation = { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } }; 
    }

    const mParam = paramsMap.get('m');

    if (mParam !== undefined) {
      if (Array.isArray(mParam) && mParam.every(row => Array.isArray(row) && row.every(val => typeof val === 'number'))) {
        m = mParam as number[][];
      } else if (this.isExtractedValue(mParam as ExtractedParameter) && (mParam as ast.Value).type === 'vector'){ // Assuming matrix is passed as a vector of vectors
        const outerVector = mParam as ast.VectorValue;
        if (outerVector.value.every(rowVal => rowVal.type === 'vector')) {
          m = (outerVector.value as ast.VectorValue[]).map(rowVec => 
            (rowVec.value as ast.Value[]).map(numVal => 
              numVal.type === 'number' ? parseFloat(numVal.value as string) : NaN
            ).filter(n => !isNaN(n))
          );
        }
        process.stdout.write(`[TransformVisitor.createMultmatrixNode] Parameter 'm' as ast.Value processed.\n`);
      }
    } else if (args.length === 1 && !this.isExtractedNamedArgument(args[0])) {
      const singleArgVal = args[0] as ast.Value;
      if (singleArgVal.type === 'vector') { // Assuming matrix is passed as a vector of vectors
         const outerVector = singleArgVal as ast.VectorValue;
        if (outerVector.value.every(rowVal => rowVal.type === 'vector')) {
          m = (outerVector.value as ast.VectorValue[]).map(rowVec => 
            (rowVec.value as ast.Value[]).map(numVal => 
              numVal.type === 'number' ? parseFloat(numVal.value as string) : NaN
            ).filter(n => !isNaN(n))
          );
        }
      }
    }

    if (m === undefined) {
      process.stdout.write(`[TransformVisitor.createMultmatrixNode] Parameter 'm' is undefined or invalid. Cannot create multmatrix node.\n`);
      return null; 
    }

    if (!((m.length === 4 && m.every(row => row.length === 3)) || (m.length === 4 && m.every(row => row.length === 4)))) {
      process.stdout.write(`[TransformVisitor.createMultmatrixNode] Matrix 'm' has invalid dimensions. Expected 4x3 or 4x4. Got ${m.length}x${m[0]?.length || 0}.\n`);
      return null;
    }

    process.stdout.write(`[TransformVisitor.createMultmatrixNode] Created multmatrix node, children=${children.length}\n`);

    return {
      type: 'multmatrix',
      m: m, 
      children: children,
      location: nodeLocation,
    };
  }

  private createColorNode(transformCstNode: TSNode, args: ExtractedParameter[], children: ast.ASTNode[]): ast.ColorNode | null {
    process.stdout.write(`[TransformVisitor.createColorNode] Creating color node with args: ${JSON.stringify(args)}\n`);
    let c: string | ast.Vector4D | undefined;
    let alpha: number | undefined;
    let nodeLocation: ast.SourceLocation | undefined;

    try {
      nodeLocation = getLocation(transformCstNode);
    } catch (e: any) {
      process.stdout.write(`[TransformVisitor.createColorNode] Error in getLocation: ${e.message}\n`);
      nodeLocation = { start: { line: 0, column: 0, offset: 0 }, end: { line: 0, column: 0, offset: 0 } };
    }

    // Logic to find 'c' (color) and 'alpha' parameters from args array
    const cParamArg = args.find(arg => arg.name === 'c' || arg.name === 'color');
    const cParam = cParamArg?.value;
    const alphaParamArg = args.find(arg => arg.name === 'alpha');
    const alphaParam = alphaParamArg?.value;

    if (cParam !== undefined) {
      if (typeof cParam === 'string') {
        c = cParam;
      } else if (Array.isArray(cParam) && cParam.every(n => typeof n === 'number')) {
        // cParam is an array of numbers
        if (cParam.length === 4) {
          c = cParam as ast.Vector4D;
        } else if (cParam.length === 3) {
          c = [...cParam, 1.0] as ast.Vector4D;
        } else if (cParam.length === 2) {
          c = [cParam[0], cParam[1], 0, 1.0] as ast.Vector4D;
        }
        // If cParam.length is not 2, 3, or 4, 'c' remains undefined here, handled by later checks
      } else if (this.isExtractedValue(cParam as ExtractedParameter)) {
        const exprNode = cParam as ast.Value;
        if (exprNode.type === 'string') {
          c = exprNode.value as string;
        } else if (exprNode.type === 'vector') {
          const evaluatedVectorC = this.evaluateVectorExpression(exprNode);
          if (evaluatedVectorC) {
            if (evaluatedVectorC.length === 4) c = evaluatedVectorC as ast.Vector4D;
            else if (evaluatedVectorC.length === 3) c = [evaluatedVectorC[0], evaluatedVectorC[1], evaluatedVectorC[2], 1.0] as ast.Vector4D;
            else if (evaluatedVectorC.length === 2) c = [evaluatedVectorC[0], evaluatedVectorC[1], 0, 1.0] as ast.Vector4D; // Treat as [R,G,0,A]
          }
        } else if (exprNode.type === 'literal' && typeof exprNode.value === 'string') { // Kept for safety, though ast.Value covers it
           c = exprNode.value;
        }
      }
    }
    if (alphaParam !== undefined) {
      if (typeof alphaParam === 'number') {
        alpha = alphaParam;
      } else if (this.isExtractedValue(alphaParam as ExtractedParameter)){
        alpha = this.evaluateNumericExpression(alphaParam as ast.Value);
      }
    }

    if (Array.isArray(c) && alpha !== undefined) {
      c[3] = alpha;
    }

    if (c === undefined) {
      process.stdout.write(`[TransformVisitor.createColorNode] Parameter 'c' is undefined or invalid. Cannot create color node.\n`);
      return null; 
    }

    process.stdout.write(`[TransformVisitor.createColorNode] Created color node with c=${JSON.stringify(c)}, children=${children.length}\n`);

    return {
      type: 'color',
      c: c, 
      children: children,
      location: nodeLocation,
    };
  }

  protected evaluateVectorExpression(expression?: ast.Value): number[] | undefined { // Return number[] for flexibility
    if (!expression) return undefined;
    process.stdout.write(`[TransformVisitor.evaluateVectorExpression] Evaluating expression: ${JSON.stringify(expression)}\n`);

    if (expression.type === 'vector') {
      const values = expression.value as ast.Value[];
      const numbers = values.map(val => {
        if (val.type === 'number') {
          const num = parseFloat(val.value as string);
          return isNaN(num) ? undefined : num;
        }
        return undefined;
      }).filter(n => n !== undefined) as number[];

      if (numbers.length > 0) return numbers;
    }
    // Removed 'literal' array check as ast.Value for vector is specific
    process.stdout.write(`[TransformVisitor.evaluateVectorExpression] Could not evaluate to vector: ${JSON.stringify(expression)}\n`);
    return undefined;
  }

  protected evaluateNumericExpression(expression?: ast.Value): number | undefined {
    if (!expression) return undefined;
    process.stdout.write(`[TransformVisitor.evaluateNumericExpression] Evaluating expression: ${JSON.stringify(expression)}\n`);

    if (expression.type === 'number') {
      const num = parseFloat(expression.value as string);
      return isNaN(num) ? undefined : num;
    }
    // Removed 'literal' number check as ast.Value for number is specific
    process.stdout.write(`[TransformVisitor.evaluateNumericExpression] Could not evaluate to number: ${JSON.stringify(expression)}\n`);
    return undefined;
  }

  protected getParametersMap(args: ExtractedParameter[]): Map<string, ast.Value> {
    const map = new Map<string, ast.Value>();
    args.forEach(arg => {
      if (this.isExtractedNamedArgument(arg)) {
        map.set(arg.name, arg.value);
      }
    });
    return map;
  }
}