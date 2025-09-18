FROM node:22-alpine

WORKDIR /application

COPY . .

RUN yarn install

EXPOSE 9000

CMD ["yarn", "dev"]