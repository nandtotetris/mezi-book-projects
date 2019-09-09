FROM node:11-alpine

# Set a working directory
WORKDIR /var/www/html


# Copy application files
COPY ./backend ./backend
COPY ./package.json ./package.json

RUN yarn workspace backend --production --pure-lockfile

# Run the container under "node" user by default
# USER node

# Run PM2 for prod
CMD [ "yarn", "workspace", "backend", "run", "start" ]
