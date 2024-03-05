FROM oven/bun:1 as builder

#debug only
ENV NODE_MAJOR=20

RUN apt-get clean && apt-get update && apt-get install ca-certificates curl gnupg vim -y 
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y


RUN npm i -g pnpm
WORKDIR /app

ENV pbase /app
ENV pbuild /app/build


RUN rm -rf build
RUN mkdir -p ${pbuild}/build/other

COPY . /app

WORKDIR ${pbase}/packages/backend

RUN pnpm i 
RUN pnpm run build:base 
RUN cp -rf dist/* ${pbuild} 
RUN cp package*.json ${pbuild} 

RUN cp -rf ${pbase}/packages/link ${pbuild}/build;

WORKDIR ${pbase}/packages/bashlike
RUN bun run build
RUN wait $!

WORKDIR ${pbase}/packages/frontend
RUN pnpm i;
RUN pnpm run build;
RUN wait $!
RUN cp -rf out ${pbuild}/build/frontend

RUN mkdir ${pbuild}/build/cdn;
RUN mkdir /data/ && openssl req -newkey rsa:2048 -new -nodes -x509 -days 7 -keyout /data/key.pem -out /data/cert.pem -subj "/C=FR/ST=Paris/O=Test/OU=Test2/CN=localhost"

# RUN

WORKDIR ${pbuild}

RUN npm i --omit=dev


CMD ["node", "."]
