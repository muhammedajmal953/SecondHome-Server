# Use Node.js alpine image for a small base image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Copy the .env file into the container (make sure .env exists in the root of your project)
COPY .env .env

# Build the application (if you're using TypeScript or any build step)
RUN npm run build

# Expose the port your application listens on
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
