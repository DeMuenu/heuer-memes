from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import pickle

anfaenge = ["Gagi des", "Furz vom", "Kinder des", "Penis des", "Arschhaar des", "Theodor der", "Heuer der"]
endungen = ["Master", "Krieger", "Magier", "Baron", "Herrscher", "Fortnite Enjoyer"]

app = Flask(__name__)
CORS(app)
passwordGlobal = "test"
# Dummy storage for tweets
tweets = []

with open('tweets.pkl', 'rb') as file:
    if file:
        tweets = pickle.load(file)

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
    if auth_header and auth_header == passwordGlobal:
        return jsonify(tweets), 200
    else:
        return jsonify({'message': 'Unauthorized'}), 401
   

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
