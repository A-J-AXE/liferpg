FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY *.mjs *.html *.css app.js ./
RUN mkdir -p .private && chown node:node .private
USER node
CMD ["node","server.mjs"]
