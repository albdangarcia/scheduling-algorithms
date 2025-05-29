# Stage 1: Builder
# Use an official Node.js runtime as the base image for building the application
FROM node:21 AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build and Prisma generation)
# Using npm ci for faster, more reliable builds if package-lock.json is present and accurate.
RUN npm ci
# Set NODE_ENV to production for the build process (e.g., for Next.js optimizations)
ENV NODE_ENV production

# Copy the rest of the application code
# This respects .dockerignore, so unnecessary files are not copied.
COPY . .

# Generate Prisma Client. This requires the Prisma CLI (from devDependencies)
# and the schema.prisma file (copied by `COPY . .`).
RUN npx prisma generate

# Build the Next.js application
RUN npm run build


# Stage 2: Production Runner
# Use a slim Node.js image for the final application. Alpine is a good choice for size.
FROM node:21-alpine AS runner
# Alternatively, if you encounter issues with Alpine:
# FROM node:21 AS runner

WORKDIR /usr/src/app

# Set NODE_ENV to production for running the application
ENV NODE_ENV production
# Copy Prisma schema first. It's needed by `prisma generate`, which is triggered
# by @prisma/client's postinstall script during `npm ci` in the next step.
COPY --from=builder /usr/src/app/prisma ./prisma

# Copy package.json and package-lock.json from the builder stage
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies.
# The postinstall script of @prisma/client should regenerate the client using the schema.
RUN npm ci --omit=dev
# Copy built public assets from the builder stage
COPY --from=builder /usr/src/app/public ./public
# Copy the Next.js build output directory
COPY --from=builder /usr/src/app/.next ./.next
# Copy next.config.mjs (or .js if you use that).
# If this file is not present in your project and this line is included, the Docker build will fail.
# Ensure this file exists at /usr/src/app/next.config.mjs in the builder stage,
# or remove/adjust this line if it's not used or has a different name.
COPY --from=builder /usr/src/app/next.config.mjs ./next.config.mjs

# The node user is provided by the official Node.js images.
USER node

# Expose port 3000 for the Next.js application
EXPOSE 3000

# Command to run the Next.js application.
CMD ["npm", "run", "start"]