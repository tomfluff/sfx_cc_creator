FROM node:18-alpine
WORKDIR /app
COPY ["package-lock.json", "package.json", "./"]
RUN npm ci
COPY . .
EXPOSE 3000