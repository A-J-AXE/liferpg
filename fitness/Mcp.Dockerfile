FROM node:24-bookworm-slim
WORKDIR /app/mcp
COPY mcp/package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY mcp/src ./src
COPY frontend/src ../frontend/src
ENTRYPOINT ["node","src/index.js"]
