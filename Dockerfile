# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies and globally required packages
RUN npm install && npm install -g nodemon typescript

# Copy the rest of the application files
COPY . .

# Expose the port on which your backend runs
EXPOSE 5000

# Command to compile TypeScript in watch mode and start the server with nodemon
CMD ["sh", "-c", "tsc -w & nodemon --exec 'ts-node -r dotenv/config' dist/index.js"]
