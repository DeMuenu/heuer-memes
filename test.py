import pickle

tweets = []

with open('tweets.pkl', 'wb') as file:
    pickle.dump(tweets, file)


with open('tweets.pkl', 'rb') as file:
    loaded_list = pickle.load(file)

print(loaded_list)