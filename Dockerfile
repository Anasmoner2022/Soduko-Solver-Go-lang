# Use an official Node.js runtime as a parent image (Alpine for smaller size)
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Install necessary dependencies for running the Go binary (libc6-compat is for Alpine)
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0-rc.2 --activate

# Enable pnpm's store for better Docker caching
RUN pnpm config set store-dir /app/.pnpm-store

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml ./

# Install app dependencies
RUN pnpm install --no-frozen-lockfile

# Copy the pre-compiled Go binary for Linux
# Ensure it was built with GOOS=linux GOARCH=amd64
COPY solver ./
# Ensure the solver binary is executable
RUN chmod +x ./solver

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["pnpm", "start"]

