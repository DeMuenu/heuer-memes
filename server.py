from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import pickle
import os
import time    


anfaenge = ["Gagi des", "Furz vom", "Kinder des", "Penis des", "Arschhaar des", "Theodor der", "Heuer der"]
endungen = ["Master", "Krieger", "Magier", "Baron", "Herrscher", "Fortnite Enjoyer"]

app = Flask(__name__)
CORS(app)

pahtHTTPS = "/var/www/html/"
passwordGlobal = "huh"
viewPass = "huh"
# Dummy storage for tweets
tweets = []
rewiews = []


try:
    with open('tweets.pkl', 'rb') as file:
        if file:
            tweets = pickle.load(file)
except:
    print("no tweets yet")

try:
    with open('rewiews.pkl', 'rb') as file:
        if file:
            rewiews = pickle.load(file)
except:
    print("no reviews yet")

@app.route('/post_tweet', methods=['POST'])
def handle_post_tweet():
    data = request.json
    password = data.get('password')
    if password == passwordGlobal:
        anfang = random.choice(anfaenge)
        ende = random.choice(endungen)
        name = f"{anfang} {ende}"
        tweets.append({'title': data['tweetTitle'], 'text': data['tweet'], 'by': name})
        with open('tweets.pkl', 'wb') as file:
            pickle.dump(tweets, file)
        return jsonify({'message': 'Tweet posted successfully'}), 200
    else:
        return jsonify({'message': 'Unauthorized'}), 401

@app.route('/get_tweets', methods=['GET'])
def handle_get_tweets():
    auth_header = request.headers.get('Authorization')
    if auth_header and (auth_header == passwordGlobal or auth_header == viewPass):
        return jsonify(tweets), 200
    else:
        return jsonify({'message': 'Unauthorized'}), 401
    


@app.route('/post_review', methods=['POST'])
def handle_post_review():
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    if 'file' in request.files:
        file = request.files['file']
    if file:
        auth_header = request.headers.get('Authorization')
        print(auth_header)
        # Process the file as needed, e.g., save it
        if auth_header and auth_header == passwordGlobal:
            filename = str(time.time()) + ".png"
            file.save(f"{pahtHTTPS}{filename}")
            
            rewiews.append({"filename" : filename, "reviews" : []})
            with open('rewiews.pkl', 'wb') as file:
                pickle.dump(rewiews, file)
            return jsonify(rewiews), 200
        else:
            return jsonify({'message': 'Unauthorized'}), 401

@app.route('/get_reviews', methods=['GET'])
def handle_get_review():
#    auth_header = request.headers.get('Authorization')
#    if auth_header and auth_header == passwordGlobal:
    return jsonify(rewiews), 200

@app.route('/post_comment', methods=['POST'])
def handle_post_comment():
    print("hah")
    data = request.json
    password = data.get('password')
    if password == passwordGlobal:
        anfang = random.choice(anfaenge)
        ende = random.choice(endungen)
        name = f"{anfang} {ende}"
        filename = data["tweetTitle"]
        print(filename)
        filename = filename.replace("_", ".")
        filename = filename + ".png"
        for t in rewiews:
            print(t)

            print(filename)
            if t["filename"] == filename:
                t["reviews"].append([data["tweet"], data ["stars"]])
                with open('rewiews.pkl', 'wb') as file:
                    pickle.dump(rewiews, file)

        #with open('tweets.pkl', 'wb') as file:
        #    pickle.dump(tweets, file)
        return jsonify({'message': 'Tweet posted successfully'}), 200
    else:
        return jsonify({'message': 'Unauthorized'}), 401

   

if __name__ == '__main__':
    #app.run(debug=True)#host='0.0.0.0', port=5000, ssl_context=('/etc/letsencrypt/live/vps2441966.servdiscount-customer.com/fullchain.pem', '/etc/letsencrypt/live/vps2441966.servdiscount-customer.com/privkey.pem'))
    app.run(host='0.0.0.0', port=5000, ssl_context=('/etc/letsencrypt/live/vps2441966.servdiscount-customer.com/fullchain.pem', '/etc/letsencrypt/live/vps2441966.servdiscount-customer.com/privkey.pem'))