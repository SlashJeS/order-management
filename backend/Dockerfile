FROM node:20

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build TypeScript code
RUN npm run build

EXPOSE 3000

# Use production start command
CMD ["npm", "start"] 