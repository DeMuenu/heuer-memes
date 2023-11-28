from flask import Flask, request, jsonify
import socket
from requests import get, post, request

# import keepalive
PassGlobal = "test"



app = Flask(__name__)

@app.route('/post', methods=['POST'])
def handle_post():
    content = request.json.get('content')
    # You can add code here to process the received content
    print("Received post:", content)
    return jsonify({"message": "Post received successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

    

    #nickname = client.recv(1024).decode('utf-8')

