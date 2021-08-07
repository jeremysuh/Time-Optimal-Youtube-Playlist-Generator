# Dockerfile for client

# Build react client
FROM node:10.16-alpine

# Set working directory to be app
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy local files to app folder
COPY . .

EXPOSE 3000

CMD ["npm","start"]