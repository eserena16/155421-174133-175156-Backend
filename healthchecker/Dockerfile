FROM golang:1.16-alpine

WORKDIR /healthchecker

COPY . .

RUN go build -o healthchecker .

EXPOSE 8090

CMD ["./healthchecker"]
