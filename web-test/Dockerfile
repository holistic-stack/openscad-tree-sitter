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

# Copy only necessary files for building
COPY grammar.js .
COPY src/ ./src/
COPY package.json .
COPY package-lock.json .
COPY binding.gyp .

# Install dependencies
RUN npm install

# Build the WebAssembly module
RUN tree-sitter generate \
    && tree-sitter build --wasm

# The output will be in the root directory as tree-sitter-openscad.wasm 