# Build stage
FROM node:18-alpine AS build

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile 
COPY . .
RUN yarn build && rm -rf ./node_modules

# Production stage
FROM node:18-alpine
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile 
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 3000

CMD ["yarn", "start:prod"]
