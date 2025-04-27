# Use an official Node.js runtime as a parent image (Alpine for smaller size)
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Install necessary dependencies for running the Go binary (libc6-compat is for Alpine)
RUN apk add --no-cache libc6-compat

# Copy package.json and lock file
# Assuming npm is used based on previous commands, copy package.json and package-lock.json (if available)
# If pnpm or yarn were used, adjust accordingly (e.g., copy pnpm-lock.yaml)
COPY package.json ./
# COPY package-lock.json ./
# COPY pnpm-lock.yaml ./

# Install app dependencies
# Use --frozen-lockfile if lock file exists and you want exact dependencies
RUN npm install

# Copy the pre-compiled Go binary for Linux
# Ensure it was built with GOOS=linux GOARCH=amd64
COPY solver ./
# Ensure the solver binary is executable
RUN chmod +x ./solver

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "start"]

