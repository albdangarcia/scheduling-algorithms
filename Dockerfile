# Use an official Node.js runtime as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Prisma CLI globally (optional, but can be useful)
# RUN npm install -g prisma

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the Prisma schema and generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the Next.js application
EXPOSE 3000

# Command to run the application
# The "db" script in your package.json handles generate and push.
# We'll run generate during build, and assume you'll handle `prisma db push`
# either manually for the first time or through a separate script/entrypoint
# if you want it to run on every startup (be cautious with this in production).
CMD ["npm", "run", "dev"]