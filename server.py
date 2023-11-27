
import socket
from requests import get, post, request

# import keepalive




host = "localhost"
port = 5345

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((host, port))
server.listen()

# keepalive.set(server)

while True:

    client, address = server.accept()

    

    #nickname = client.recv(1024).decode('utf-8')

