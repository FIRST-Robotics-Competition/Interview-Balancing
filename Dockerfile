FROM node:20.15.1

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 8080
ENTRYPOINT [ "pnpm", "run", "dev", "--port", "8080", "--host", "0.0.0.0" ]
