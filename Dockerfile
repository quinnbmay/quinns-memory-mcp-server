FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

# Install dependencies - use npm install instead of ci for better compatibility
RUN npm install --production=false

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port (Smithery will override this)
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]