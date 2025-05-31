#!/bin/bash
set -e
echo "Starting environment setup..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
echo "Sourcing nvm.sh..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
echo "Installing Node.js 22..."
nvm install 22
echo "Using Node.js 22..."
nvm use 22
echo "Enabling pnpm..."
corepack enable pnpm
echo "pnpm version:"
pnpm -v
echo "Installing dependencies with pnpm..."
pnpm install
echo "Environment setup complete."
