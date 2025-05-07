# Browser Compatibility Testing

This document outlines the browser compatibility testing for the OpenSCAD Tree-sitter WebAssembly module.

## Tested Browsers

The WebAssembly module has been tested with the following browsers:

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome  | 90+     | ✅     | Works without issues |
| Firefox | 80+     | ✅     | Works without issues |
| Safari  | 14+     | ✅     | Works without issues |
| Edge    | 90+     | ✅     | Works without issues |

## Testing Procedure

1. Run the browser test server:
   ```bash
   pnpm test:browser:improved
   ```

2. Open the test page in each browser.

3. Verify that:
   - The parser loads successfully
   - The example code parses correctly
   - The syntax tree is displayed properly
   - All examples can be loaded and parsed

## Common Issues and Solutions

### CORS Issues

If you encounter CORS issues when loading the WebAssembly file, ensure that:

1. You're using a proper HTTP server (like the one provided by `pnpm test:browser`)
2. The server is setting the correct MIME type for WebAssembly files (`application/wasm`)

### WebAssembly Support

WebAssembly is supported in all modern browsers, but older browsers may not support it. The minimum browser versions for WebAssembly support are:

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

### Performance Considerations

- Large files may cause performance issues in browsers
- Consider using web workers for parsing large files
- Initialize the parser once and reuse it for better performance

## Troubleshooting

If you encounter issues with a specific browser:

1. Check the browser console for errors
2. Verify that WebAssembly is supported in your browser version
3. Try clearing the browser cache
4. Ensure that JavaScript is enabled
5. Check if any browser extensions might be interfering with WebAssembly execution
