FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application code
COPY src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcp-server -u 1001

# Change ownership
RUN chown -R mcp-server:nodejs /app
USER mcp-server

# MCP server runs via stdio, no exposed ports needed
# Default environment for standalone Docker run
ENV API_BASE_URL=http://192.168.4.121:3001/api
ENV NODE_ENV=production

CMD ["npm", "start"]