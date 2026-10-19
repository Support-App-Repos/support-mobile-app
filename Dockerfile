# Use Node.js LTS version
FROM node:18-alpine

# Install Prisma dependencies (needed for Prisma CLI and native bindings)
RUN apk add --no-cache openssl libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install dependencies (including devDependencies for Prisma CLI)
RUN npm ci

# Generate Prisma Client
RUN npm run prisma:generate

# Copy application code
COPY . .

# Create env directory if it doesn't exist
RUN mkdir -p env

# Expose the port the app runs on
EXPOSE 3000

# Set NODE_ENV to production by default
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthcheck', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
