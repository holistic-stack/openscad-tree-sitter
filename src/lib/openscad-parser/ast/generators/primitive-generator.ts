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
      // 3D primitives
      case 'cube':
        return this.createCubeNode(node, args);
      case 'sphere':
        return this.createSphereNode(node, args);
      case 'cylinder':
        return this.createCylinderNode(node, args);
      case 'polyhedron':
        return this.createPolyhedronNode(node, args);

      // 2D primitives
      case 'circle':
        return this.createCircleNode(node, args);
      case 'square':
        return this.createSquareNode(node, args);
      case 'polygon':
        return this.createPolygonNode(node, args);
      case 'text':
        return this.createTextNode(node, args);

      // Extrusion operations
      case 'linear_extrude':
        return this.createLinearExtrudeNode(node, args);
      case 'rotate_extrude':
        return this.createRotateExtrudeNode(node, args);

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

  /**
   * Create a polyhedron node
   */
  private createPolyhedronNode(node: TSNode, args: ast.Parameter[]): ast.PolyhedronNode {
    let pointsParamValue: ast.ParameterValue | undefined = undefined;
    let facesParamValue: ast.ParameterValue | undefined = undefined;
    let trianglesParamValue: ast.ParameterValue | undefined = undefined;
    let convexityParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'points') {
        pointsParamValue = arg.value;
      } else if (arg.name === 'faces') {
        facesParamValue = arg.value;
      } else if (arg.name === 'triangles') {
        trianglesParamValue = arg.value;
      } else if (arg.name === 'convexity') {
        convexityParamValue = arg.value;
      }
    }

    // Validate points parameter
    if (!pointsParamValue || !Array.isArray(pointsParamValue) || pointsParamValue.length === 0) {
      console.warn('[PrimitiveGenerator.createPolyhedronNode] Invalid or missing points parameter');
      // Default to a simple tetrahedron
      pointsParamValue = [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
    }

    // Validate faces/triangles parameter
    let faces: number[][];
    if (trianglesParamValue && Array.isArray(trianglesParamValue) && trianglesParamValue.length > 0) {
      // Use triangles parameter if provided
      faces = trianglesParamValue as number[][];
    } else if (facesParamValue && Array.isArray(facesParamValue) && facesParamValue.length > 0) {
      // Use faces parameter if provided
      faces = facesParamValue as number[][];
    } else {
      console.warn('[PrimitiveGenerator.createPolyhedronNode] Invalid or missing faces/triangles parameter');
      // Default to a simple tetrahedron
      faces = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 1],
        [1, 3, 2]
      ];
    }

    // Determine the convexity value
    const convexity = typeof convexityParamValue === 'number' ? convexityParamValue : 1;

    return {
      type: 'polyhedron',
      points: pointsParamValue as ast.Vector3D[],
      faces,
      convexity,
      children: [],
      location: getLocation(node)
    };
  }

  /**
   * Create a circle node
   */
  private createCircleNode(node: TSNode, args: ast.Parameter[]): ast.CircleNode {
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
    let r: number | undefined;
    let d: number | undefined;

    if (typeof rParamValue === 'number') {
      r = rParamValue;
    } else if (typeof dParamValue === 'number') {
      d = dParamValue;
      r = d / 2;
    } else {
      // Default radius is 1
      r = 1;
    }

    // Determine the resolution parameters
    const $fn = typeof fnParamValue === 'number' ? fnParamValue : 0;
    const $fa = typeof faParamValue === 'number' ? faParamValue : 12;
    const $fs = typeof fsParamValue === 'number' ? fsParamValue : 2;

    return {
      type: 'circle',
      r,
      d,
      $fn,
      $fa,
      $fs,
      children: [],
      location: getLocation(node)
    };
  }

  /**
   * Create a square node
   */
  private createSquareNode(node: TSNode, args: ast.Parameter[]): ast.SquareNode {
    let sizeParamValue: ast.ParameterValue | undefined = undefined;
    let centerParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'size') {
        sizeParamValue = arg.value;
      } else if (arg.name === 'center') {
        centerParamValue = arg.value;
      } else if (!arg.name && sizeParamValue === undefined) {
        // First positional argument is size
        sizeParamValue = arg.value;
      }
    }

    // Determine the size value
    let size: ast.Vector2D | number;
    if (sizeParamValue && Array.isArray(sizeParamValue) && sizeParamValue.length === 2) {
      size = sizeParamValue as ast.Vector2D;
    } else if (typeof sizeParamValue === 'number') {
      // If it's a single number, use it for both dimensions
      size = sizeParamValue;
    } else {
      // Default size is 1
      size = 1;
    }

    // Determine the center value
    const center = typeof centerParamValue === 'boolean' ? centerParamValue : false;

    return {
      type: 'square',
      size,
      center,
      children: [],
      location: getLocation(node)
    };
  }

  /**
   * Create a polygon node
   */
  private createPolygonNode(node: TSNode, args: ast.Parameter[]): ast.PolygonNode {
    let pointsParamValue: ast.ParameterValue | undefined = undefined;
    let pathsParamValue: ast.ParameterValue | undefined = undefined;
    let convexityParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'points') {
        pointsParamValue = arg.value;
      } else if (arg.name === 'paths') {
        pathsParamValue = arg.value;
      } else if (arg.name === 'convexity') {
        convexityParamValue = arg.value;
      }
    }

    // Validate points parameter
    if (!pointsParamValue || !Array.isArray(pointsParamValue) || pointsParamValue.length === 0) {
      console.warn('[PrimitiveGenerator.createPolygonNode] Invalid or missing points parameter');
      // Default to a simple triangle
      pointsParamValue = [
        [0, 0],
        [1, 0],
        [0, 1]
      ];
    }

    // Validate paths parameter
    let paths: number[][] | undefined;
    if (pathsParamValue && Array.isArray(pathsParamValue) && pathsParamValue.length > 0) {
      paths = pathsParamValue as number[][];
    }

    // Determine the convexity value
    const convexity = typeof convexityParamValue === 'number' ? convexityParamValue : 1;

    return {
      type: 'polygon',
      points: pointsParamValue as ast.Vector2D[],
      paths,
      convexity,
      children: [],
      location: getLocation(node)
    };
  }

  /**
   * Create a text node
   */
  private createTextNode(node: TSNode, args: ast.Parameter[]): ast.TextNode {
    let textParamValue: ast.ParameterValue | undefined = undefined;
    let sizeParamValue: ast.ParameterValue | undefined = undefined;
    let fontParamValue: ast.ParameterValue | undefined = undefined;
    let halignParamValue: ast.ParameterValue | undefined = undefined;
    let valignParamValue: ast.ParameterValue | undefined = undefined;
    let spacingParamValue: ast.ParameterValue | undefined = undefined;
    let directionParamValue: ast.ParameterValue | undefined = undefined;
    let languageParamValue: ast.ParameterValue | undefined = undefined;
    let scriptParamValue: ast.ParameterValue | undefined = undefined;
    let fnParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'text') {
        textParamValue = arg.value;
      } else if (arg.name === 'size') {
        sizeParamValue = arg.value;
      } else if (arg.name === 'font') {
        fontParamValue = arg.value;
      } else if (arg.name === 'halign') {
        halignParamValue = arg.value;
      } else if (arg.name === 'valign') {
        valignParamValue = arg.value;
      } else if (arg.name === 'spacing') {
        spacingParamValue = arg.value;
      } else if (arg.name === 'direction') {
        directionParamValue = arg.value;
      } else if (arg.name === 'language') {
        languageParamValue = arg.value;
      } else if (arg.name === 'script') {
        scriptParamValue = arg.value;
      } else if (arg.name === '$fn') {
        fnParamValue = arg.value;
      } else if (!arg.name && textParamValue === undefined) {
        // First positional argument is text
        textParamValue = arg.value;
      }
    }

    // Validate text parameter
    if (typeof textParamValue !== 'string') {
      console.warn('[PrimitiveGenerator.createTextNode] Invalid or missing text parameter');
      textParamValue = '';
    }

    // Determine the size value
    const size = typeof sizeParamValue === 'number' ? sizeParamValue : 10;

    // Determine the font value
    const font = typeof fontParamValue === 'string' ? fontParamValue : 'Liberation Sans';

    // Determine the alignment values
    const halign = typeof halignParamValue === 'string' ? halignParamValue : 'left';
    const valign = typeof valignParamValue === 'string' ? valignParamValue : 'baseline';

    // Determine the spacing value
    const spacing = typeof spacingParamValue === 'number' ? spacingParamValue : 1;

    // Determine the direction value
    const direction = typeof directionParamValue === 'string' ? directionParamValue : 'ltr';

    // Determine the language and script values
    const language = typeof languageParamValue === 'string' ? languageParamValue : 'en';
    const script = typeof scriptParamValue === 'string' ? scriptParamValue : 'latin';

    // Determine the resolution parameter
    const $fn = typeof fnParamValue === 'number' ? fnParamValue : 0;

    return {
      type: 'text',
      text: textParamValue,
      size,
      font,
      halign,
      valign,
      spacing,
      direction,
      language,
      script,
      $fn,
      children: [],
      location: getLocation(node)
    };
  }

  /**
   * Create a linear_extrude node
   */
  private createLinearExtrudeNode(node: TSNode, args: ast.Parameter[]): ast.LinearExtrudeNode {
    let heightParamValue: ast.ParameterValue | undefined = undefined;
    let centerParamValue: ast.ParameterValue | undefined = undefined;
    let convexityParamValue: ast.ParameterValue | undefined = undefined;
    let twistParamValue: ast.ParameterValue | undefined = undefined;
    let slicesParamValue: ast.ParameterValue | undefined = undefined;
    let scaleParamValue: ast.ParameterValue | undefined = undefined;
    let fnParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'height') {
        heightParamValue = arg.value;
      } else if (arg.name === 'center') {
        centerParamValue = arg.value;
      } else if (arg.name === 'convexity') {
        convexityParamValue = arg.value;
      } else if (arg.name === 'twist') {
        twistParamValue = arg.value;
      } else if (arg.name === 'slices') {
        slicesParamValue = arg.value;
      } else if (arg.name === 'scale') {
        scaleParamValue = arg.value;
      } else if (arg.name === '$fn') {
        fnParamValue = arg.value;
      } else if (!arg.name && heightParamValue === undefined) {
        // First positional argument is height
        heightParamValue = arg.value;
      }
    }

    // Determine the height value
    const height = typeof heightParamValue === 'number' ? heightParamValue : 1;

    // Determine the center value
    const center = typeof centerParamValue === 'boolean' ? centerParamValue : false;

    // Determine the convexity value
    const convexity = typeof convexityParamValue === 'number' ? convexityParamValue : 10;

    // Determine the twist value
    const twist = typeof twistParamValue === 'number' ? twistParamValue : 0;

    // Determine the slices value
    const slices = typeof slicesParamValue === 'number' ? slicesParamValue : 1;

    // Determine the scale value
    let scale: number | ast.Vector2D;
    if (scaleParamValue && Array.isArray(scaleParamValue) && scaleParamValue.length === 2) {
      scale = scaleParamValue as ast.Vector2D;
    } else if (typeof scaleParamValue === 'number') {
      scale = scaleParamValue;
    } else {
      scale = 1;
    }

    // Determine the resolution parameter
    const $fn = typeof fnParamValue === 'number' ? fnParamValue : 0;

    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'linear_extrude',
      height,
      center,
      convexity,
      twist,
      slices,
      scale,
      $fn,
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a rotate_extrude node
   */
  private createRotateExtrudeNode(node: TSNode, args: ast.Parameter[]): ast.RotateExtrudeNode {
    let angleParamValue: ast.ParameterValue | undefined = undefined;
    let convexityParamValue: ast.ParameterValue | undefined = undefined;
    let fnParamValue: ast.ParameterValue | undefined = undefined;
    let faParamValue: ast.ParameterValue | undefined = undefined;
    let fsParamValue: ast.ParameterValue | undefined = undefined;

    // Extract parameters
    for (const arg of args) {
      if (arg.name === 'angle') {
        angleParamValue = arg.value;
      } else if (arg.name === 'convexity') {
        convexityParamValue = arg.value;
      } else if (arg.name === '$fn') {
        fnParamValue = arg.value;
      } else if (arg.name === '$fa') {
        faParamValue = arg.value;
      } else if (arg.name === '$fs') {
        fsParamValue = arg.value;
      } else if (!arg.name && angleParamValue === undefined) {
        // First positional argument is angle
        angleParamValue = arg.value;
      }
    }

    // Determine the angle value
    const angle = typeof angleParamValue === 'number' ? angleParamValue : 360;

    // Determine the convexity value
    const convexity = typeof convexityParamValue === 'number' ? convexityParamValue : 10;

    // Determine the resolution parameters
    const $fn = typeof fnParamValue === 'number' ? fnParamValue : 0;
    const $fa = typeof faParamValue === 'number' ? faParamValue : 12;
    const $fs = typeof fsParamValue === 'number' ? fsParamValue : 2;

    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'rotate_extrude',
      angle,
      convexity,
      $fn,
      $fa,
      $fs,
      children,
      location: getLocation(node)
    };
  }

  /**
   * Process child nodes of a module instantiation
   */
  private processChildNodes(node: TSNode, children: ast.ASTNode[]): void {
    // Check for a body node
    const bodyNode = node.childForFieldName('body');
    if (bodyNode) {
      if (bodyNode.type === 'block') {
        console.log(`[PrimitiveGenerator.processChildNodes] Found block body for ${node.text.substring(0,30)}`);
        for (const statementCSTNode of bodyNode.children) {
          if (statementCSTNode && statementCSTNode.type === 'statement') {
            this.processNode(statementCSTNode, children);
          }
        }
      } else if (bodyNode.type === 'statement') {
        console.log(`[PrimitiveGenerator.processChildNodes] Found statement body for ${node.text.substring(0,30)}: ${bodyNode.text.substring(0,20)}`);
        this.processNode(bodyNode, children);
      }
    } else {
      // No explicit body, check for an immediately following statement
      const nextSibling = node.nextSibling;
      if (nextSibling && nextSibling.type === 'statement') {
        console.log(`[PrimitiveGenerator.processChildNodes] Found next sibling statement for ${node.text.substring(0,30)}: ${nextSibling.text.substring(0,20)}`);
        this.processNode(nextSibling, children);
      } else {
        console.log(`[PrimitiveGenerator.processChildNodes] No body and no next sibling statement found for ${node.text.substring(0,30)}. Next sibling type: ${nextSibling?.type}`);
      }
    }
  }
}
