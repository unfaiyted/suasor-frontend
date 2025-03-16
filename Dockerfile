# Build stage
FROM oven/bun:1 as builder

# Define build arguments for environment variables
# ARG VITE_API_KEY
ARG VITE_API_BASE_URL

# Set environment variables during the build process
# ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun --bun run build

# List directory contents to see where build files went
# RUN ls -la

# Production stage
FROM oven/bun:1-slim as production

WORKDIR /app

# Copy build files and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app ./
# We'll uncomment the correct directory once we find it
# COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Expose the port the app will run on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["bun", "run", "./build/index.js"]

