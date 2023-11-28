from flask import Flask, request, jsonify
from flask_cors import CORS
import random

anfaenge = ["Gagi des", "Furz vom", "Kinder des", "Penis des", "Arschhaar des", "Theodor der", "Heuer der"]
endungen = ["Master", "Krieger", "Magier", "Baron", "Herrscher", "Fortnite Enjoyer"]

app = Flask(__name__)
CORS(app)
passwordGlobal = "test"
# Dummy storage for tweets
tweets = [{'title': "Simu", 'text': "lol simu macht scheiss", 'by': "Gagi"}]

@app.route('/post_tweet', methods=['POST'])
def handle_post_tweet():
    data = request.json
    password = data.get('password')
    if password == passwordGlobal:
        anfang = random.choice(anfaenge)
        ende = random.choice(endungen)
        name = f"{anfang} {ende}"
        tweets.append({'title': data['tweetTitle'], 'text': data['tweet'], 'by': name})
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
    app.run(debug=True)
