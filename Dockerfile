FROM emscripten/emsdk:latest

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g tree-sitter-cli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire project for building
COPY . .

# Generate the parser code and build the WebAssembly module
RUN tree-sitter generate \
    && tree-sitter build --wasm

# Create an output directory for the WASM file
RUN mkdir -p /output && cp tree-sitter-openscad.wasm /output/

# Set the output directory as a volume
VOLUME /output 