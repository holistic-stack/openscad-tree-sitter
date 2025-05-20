import { TSNode, getLocation } from '../utils/location-utils';
import * as ast from '../ast-types';
import { BaseGenerator } from './base-generator';

/**
 * Generator for primitive nodes (cube, sphere, cylinder)
 */
export class PrimitiveGenerator extends BaseGenerator {
  /**
   * Create an AST node based on the function name
   */
  protected createASTNode(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    switch (functionName) {
      case 'cube':
        return this.createCubeNode(node, args);
      case 'sphere':
        return this.createSphereNode(node, args);
      case 'cylinder':
        return this.createCylinderNode(node, args);
      default:
        return null;
    }
  }

  /**
   * Create a cube node
   */
  private createCubeNode(node: TSNode, args: ast.Parameter[]): ast.CubeNode {
    let sizeParamValue: ast.ParameterValue | undefined = undefined;
    let centerParamValue: ast.ParameterValue | undefined = undefined;

    // Extract size parameter
    const namedSizeArg = args.find(arg => arg.name === 'size');
    if (namedSizeArg) {
      sizeParamValue = namedSizeArg.value;
      console.log(`[PrimitiveGenerator.createCubeNode] Found named 'size' argument. Value: ${JSON.stringify(sizeParamValue)}`);
    } else {
      const positionalSizeArg = args.find(arg => !arg.name); // Assuming 'size' is the first positional if not named
      if (positionalSizeArg) {
        sizeParamValue = positionalSizeArg.value;
        console.log(`[PrimitiveGenerator.createCubeNode] Found positional size argument. Value: ${JSON.stringify(sizeParamValue)}`);
      } else {
        console.log(`[PrimitiveGenerator.createCubeNode] No named 'size' or positional size argument found for cube node: ${node.text.substring(0,30)}`);
      }
    }

    // Extract center parameter
    const centerArg = args.find(arg => arg.name === 'center');
    if (centerArg) {
      centerParamValue = centerArg.value;
      console.log(`[PrimitiveGenerator.createCubeNode] Found 'center' argument. Value: ${JSON.stringify(centerParamValue)}`);
    }

    // Determine the size value
    let size: ast.Vector3D | number;
    if (sizeParamValue && Array.isArray(sizeParamValue) && (sizeParamValue.length === 2 || sizeParamValue.length === 3)) {
      // If it's a 2D vector, convert to 3D by adding 0 for z
      size = sizeParamValue.length === 2 
        ? [sizeParamValue[0], sizeParamValue[1], 0] as ast.Vector3D
        : sizeParamValue as ast.Vector3D;
    } else if (typeof sizeParamValue === 'number') {
      // If it's a single number, use it for all dimensions
      size = sizeParamValue;
    } else {
      // Default size is 1
      size = 1;
    }

    // Determine the center value
    const center = typeof centerParamValue === 'boolean' ? centerParamValue : false;

    return {
      type: 'cube',
      size,
      center,
      children: [],
      location: getLocation(node)
    };
  }

  /**
   * Create a sphere node
   */
  private createSphereNode(node: TSNode, args: ast.Parameter[]): ast.SphereNode {
    let rParamValue: ast.ParameterValue | undefined = undefined;
    let dParamValue: ast.ParameterValue | undefined = undefined;
    let fnParamValue: ast.ParameterValue | undefined = undefined;
    let faParamValue: ast.ParameterValue | undefined = undefined;
    let fsParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'r') {
        rParamValue = arg.value;
      } else if (arg.name === 'd') {
        dParamValue = arg.value;
      } else if (arg.name === '$fn') {
        fnParamValue = arg.value;
      } else if (arg.name === '$fa') {
        faParamValue = arg.value;
      } else if (arg.name === '$fs') {
        fsParamValue = arg.value;
      } else if (!arg.name && rParamValue === undefined && dParamValue === undefined) {
        // First positional argument is radius
        rParamValue = arg.value;
      }
    }

    // Determine the radius value
    let r: number;
    if (typeof rParamValue === 'number') {
      r = rParamValue;
    } else if (typeof dParamValue === 'number') {
      r = dParamValue / 2;
    } else {
      // Default radius is 1
      r = 1;
    }

    // Determine the resolution parameters
    const $fn = typeof fnParamValue === 'number' ? fnParamValue : 0;
    const $fa = typeof faParamValue === 'number' ? faParamValue : 12;
    const $fs = typeof fsParamValue === 'number' ? fsParamValue : 2;

    return {
      type: 'sphere',
      r,
      $fn,
      $fa,
      $fs,
      children: [],
      location: getLocation(node)
    };
  }

  /**
   * Create a cylinder node
   */
  private createCylinderNode(node: TSNode, args: ast.Parameter[]): ast.CylinderNode {
    let hParamValue: ast.ParameterValue | undefined = undefined;
    let r1ParamValue: ast.ParameterValue | undefined = undefined;
    let r2ParamValue: ast.ParameterValue | undefined = undefined;
    let rParamValue: ast.ParameterValue | undefined = undefined;
    let d1ParamValue: ast.ParameterValue | undefined = undefined;
    let d2ParamValue: ast.ParameterValue | undefined = undefined;
    let dParamValue: ast.ParameterValue | undefined = undefined;
    let centerParamValue: ast.ParameterValue | undefined = undefined;
    let fnParamValue: ast.ParameterValue | undefined = undefined;
    let faParamValue: ast.ParameterValue | undefined = undefined;
    let fsParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'h') {
        hParamValue = arg.value;
      } else if (arg.name === 'r1') {
        r1ParamValue = arg.value;
      } else if (arg.name === 'r2') {
        r2ParamValue = arg.value;
      } else if (arg.name === 'r') {
        rParamValue = arg.value;
      } else if (arg.name === 'd1') {
        d1ParamValue = arg.value;
      } else if (arg.name === 'd2') {
        d2ParamValue = arg.value;
      } else if (arg.name === 'd') {
        dParamValue = arg.value;
      } else if (arg.name === 'center') {
        centerParamValue = arg.value;
      } else if (arg.name === '$fn') {
        fnParamValue = arg.value;
      } else if (arg.name === '$fa') {
        faParamValue = arg.value;
      } else if (arg.name === '$fs') {
        fsParamValue = arg.value;
      } else if (!arg.name && hParamValue === undefined) {
        // First positional argument is height
        hParamValue = arg.value;
      } else if (!arg.name && rParamValue === undefined && r1ParamValue === undefined && r2ParamValue === undefined) {
        // Second positional argument is radius
        rParamValue = arg.value;
      }
    }

    // Determine the height value
    const h = typeof hParamValue === 'number' ? hParamValue : 1;

    // Determine the radius values
    let r1: number;
    let r2: number;

    if (typeof r1ParamValue === 'number') {
      r1 = r1ParamValue;
    } else if (typeof d1ParamValue === 'number') {
      r1 = d1ParamValue / 2;
    } else if (typeof rParamValue === 'number') {
      r1 = rParamValue;
    } else if (typeof dParamValue === 'number') {
      r1 = dParamValue / 2;
    } else {
      // Default radius is 1
      r1 = 1;
    }

    if (typeof r2ParamValue === 'number') {
      r2 = r2ParamValue;
    } else if (typeof d2ParamValue === 'number') {
      r2 = d2ParamValue / 2;
    } else if (typeof rParamValue === 'number') {
      r2 = rParamValue;
    } else if (typeof dParamValue === 'number') {
      r2 = dParamValue / 2;
    } else {
      // Default radius is 1
      r2 = 1;
    }

    // Determine the center value
    const center = typeof centerParamValue === 'boolean' ? centerParamValue : false;

    // Determine the resolution parameters
    const $fn = typeof fnParamValue === 'number' ? fnParamValue : 0;
    const $fa = typeof faParamValue === 'number' ? faParamValue : 12;
    const $fs = typeof fsParamValue === 'number' ? fsParamValue : 2;

    return {
      type: 'cylinder',
      h,
      r1,
      r2,
      center,
      $fn,
      $fa,
      $fs,
      children: [],
      location: getLocation(node)
    };
  }
}
