# Use an official Node.js runtime as the base image
FROM node:21

# Set the working directory in the container to /usr/src/app
# WORKDIR /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000 in the container
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]