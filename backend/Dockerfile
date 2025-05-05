FROM node:20

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

EXPOSE 3000

# Use nodemon for development
CMD ["npm", "run", "dev"] 