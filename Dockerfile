FROM node:22-slim
WORKDIR /app
COPY package.json ./
# No lockfile is shipped; install resolves against the ranges in package.json.
RUN npm install
COPY tsconfig.json ./
COPY src ./src
COPY tests ./tests
EXPOSE 4000
CMD ["npm", "start"]
