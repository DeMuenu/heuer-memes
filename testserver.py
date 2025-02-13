import os
import json
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])  # Passe ggf. die Client-IP an
app.secret_key = os.urandom(24)
DATA_FILE = 'data.json'
IMAGE_UPLOAD_FOLDER = "AchivementBilder"

# Sicherstellen, dass der Upload-Ordner existiert
if not os.path.exists(IMAGE_UPLOAD_FOLDER):
    os.makedirs(IMAGE_UPLOAD_FOLDER)

def load_data():
    if not os.path.exists(DATA_FILE):
        default = {
            "adminPassword": "admin",
            "users": [],
            "achievements": []
        }
        with open(DATA_FILE, 'w') as f:
            json.dump(default, f)
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

@app.route('/api/login', methods=['POST'])
def handle_login():
    data = request.json
    password = data.get('password')
    stored = load_data()
    if password == stored['adminPassword']:
        session['authenticated'] = True
        session['role'] = 'admin'
        return jsonify(success=True, role='admin')
    elif password == 'view':
        session['authenticated'] = True
        session['role'] = 'viewer'
        return jsonify(success=True, role='viewer')
    return jsonify(success=False), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify(success=True)

@app.route('/api/data', methods=['GET'])
def get_data():
    if not session.get('authenticated'):
        return jsonify(success=False, error="Not authenticated"), 401
    data = load_data()
    return jsonify({
        'users': data['users'],
        'achievements': data['achievements']
    })

@app.route('/api/addUser', methods=['POST'])
def add_user():
    if not (session.get('authenticated') and session.get('role') == 'admin'):
        return jsonify(success=False), 401
    data = request.json
    stored = load_data()
    new_user = {
        "id": len(stored['users']) + 1,
        "name": data['name'],
        "achievements": []
    }
    stored['users'].append(new_user)
    with open(DATA_FILE, 'w') as f:
        json.dump(stored, f)
    return jsonify(success=True)

@app.route('/api/addAchievement', methods=['POST'])
def add_achievement():
    if not (session.get('authenticated') and session.get('role') == 'admin'):
        return jsonify(success=False), 401

    # Unterschiedliche Verarbeitung: multipart/form-data (für Upload) oder JSON
    if request.content_type.startswith('multipart/form-data'):
        name = request.form.get('name')
        description = request.form.get('description')
        file = request.files.get('image')
        if file and file.filename != "":
            filename = secure_filename(file.filename)
            file.save(os.path.join(IMAGE_UPLOAD_FOLDER, filename))
            image_path = f"{IMAGE_UPLOAD_FOLDER}/{filename}"
        else:
            image_path = ""
    else:
        data = request.json
        name = data.get('name')
        description = data.get('description')
        image_path = ""
    
    stored = load_data()
    new_achievement = {
        "id": len(stored['achievements']) + 1,
        "name": name,
        "description": description,
        "image": image_path
    }
    stored['achievements'].append(new_achievement)
    with open(DATA_FILE, 'w') as f:
        json.dump(stored, f)
    return jsonify(success=True)

@app.route('/api/assignAchievement', methods=['POST'])
def assign_achievement():
    if not (session.get('authenticated') and session.get('role') == 'admin'):
        return jsonify(success=False), 401
    
    data = request.json
    try:
        user_id = int(data['userId'])
        achievement_id = int(data['achievementId'])
        level = data['level']
    except (KeyError, ValueError) as e:
        return jsonify(success=False, error=str(e)), 400

    stored = load_data()
    user = next((u for u in stored['users'] if u['id'] == user_id), None)
    
    if user and any(a['aid'] == achievement_id for a in user['achievements']):
        return jsonify(success=False, error="Achievement already assigned"), 400

    if user:
        user['achievements'].append({
            "aid": achievement_id,
            "level": level
        })
        with open(DATA_FILE, 'w') as f:
            json.dump(stored, f)
        return jsonify(success=True)
    return jsonify(success=False, error="User not found"), 404

@app.route('/api/removeAchievement', methods=['POST'])
def remove_achievement():
    if not (session.get('authenticated') and session.get('role') == 'admin'):
        return jsonify(success=False), 401
    
    data = request.json
    try:
        user_id = int(data['userId'])
        achievement_id = int(data['achievementId'])
    except (KeyError, ValueError) as e:
        return jsonify(success=False, error=str(e)), 400

    stored = load_data()
    user = next((u for u in stored['users'] if u['id'] == user_id), None)
    
    if user:
        initial_count = len(user['achievements'])
        user['achievements'] = [a for a in user['achievements'] if a['aid'] != achievement_id]
        if len(user['achievements']) < initial_count:
            with open(DATA_FILE, 'w') as f:
                json.dump(stored, f)
            return jsonify(success=True)
        return jsonify(success=False, error="Achievement not found"), 404
    return jsonify(success=False, error="User not found"), 404

# Neuer Endpunkt: Löschen eines Users
@app.route('/api/deleteUser', methods=['POST'])
def delete_user():
    if not (session.get('authenticated') and session.get('role') == 'admin'):
        return jsonify(success=False), 401
    data = request.json
    try:
        user_id = int(data['userId'])
    except (KeyError, ValueError) as e:
        return jsonify(success=False, error=str(e)), 400
    stored = load_data()
    new_users = [u for u in stored['users'] if u['id'] != user_id]
    if len(new_users) == len(stored['users']):
        return jsonify(success=False, error="User not found"), 404
    stored['users'] = new_users
    with open(DATA_FILE, 'w') as f:
        json.dump(stored, f)
    return jsonify(success=True)

# Neuer Endpunkt: Löschen eines Achievements (und aus allen Usern entfernen)
@app.route('/api/deleteAchievement', methods=['POST'])
def delete_achievement():
    if not (session.get('authenticated') and session.get('role') == 'admin'):
        return jsonify(success=False), 401
    data = request.json
    try:
        achievement_id = int(data['achievementId'])
    except (KeyError, ValueError) as e:
        return jsonify(success=False, error=str(e)), 400
    stored = load_data()
    new_achievements = [a for a in stored['achievements'] if a['id'] != achievement_id]
    if len(new_achievements) == len(stored['achievements']):
        return jsonify(success=False, error="Achievement not found"), 404
    stored['achievements'] = new_achievements
    # Entferne das Achievement aus allen Usern
    for user in stored['users']:
        user['achievements'] = [a for a in user['achievements'] if a['aid'] != achievement_id]
    with open(DATA_FILE, 'w') as f:
        json.dump(stored, f)
    return jsonify(success=True)

# Bereitstellung der hochgeladenen Bilder
@app.route('/AchivementBilder/<path:filename>')
def achievement_image(filename):
    return send_from_directory(IMAGE_UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
