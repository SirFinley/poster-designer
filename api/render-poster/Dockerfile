FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install curl unzip -y

# install aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

# install node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash 
RUN apt-get install -y nodejs

RUN npm install -g claudia@5.14.0 typescript@4.4.4

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .