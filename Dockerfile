FROM oven/bun:1

ENV cert=/data/cert.pem key=/data/key.pem webhook="https://discord.com/api/webhooks/1139681148474228869/dhpEdAYqfMbtCnN1l-BT9Dz-jDbQR-7HsJXA4Eed9M8Q3BZb9CcspU2_8IGnRScdRZ-C"

#debug only
ENV NODE_MAJOR=20

RUN apt-get clean && apt-get update && apt-get install ca-certificates curl gnupg git unzip -y 
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y

RUN mkdir /data/ && openssl req -newkey rsa:2048 -new -nodes -x509 -days 7 -keyout /data/key.pem -out /data/cert.pem -subj "/C=FR/ST=Paris/O=Test/OU=Test2/CN=localhost"

RUN npm i -g pnpm nodemon pm2
WORKDIR /build
COPY . /build

RUN bash docker.sh

RUN cp /build/packages/backend/.docker.env /build/build/.env

EXPOSE 80 443

CMD ["pm2-runtime", "--json", "ecosystem.config.js"]