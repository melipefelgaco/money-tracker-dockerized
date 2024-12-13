FROM node:18.20.3
WORKDIR /backend
COPY package*.json ./
COPY . /backend
RUN npm install nodemon -g
RUN npm install
RUN apt-get update
RUN apt-get install -y default-mysql-client
EXPOSE 8080
CMD ["npm", "run", "dev"]