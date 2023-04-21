# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /hacktues9-memelitrix

COPY server server
COPY client client

WORKDIR /hacktues9-memelitrix/server

RUN pip3 install -r requirements.txt
CMD [ "python3", "server.py"]
