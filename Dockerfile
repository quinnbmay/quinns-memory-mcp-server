FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including Smithery CLI
RUN npm install

# Copy source code and config files
COPY src/ ./src/
COPY tsconfig.json ./
COPY tsup.config.ts ./
COPY smithery.yaml ./

# Build the application using Smithery CLI
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the HTTP server version
CMD ["node", "dist/server.js"]