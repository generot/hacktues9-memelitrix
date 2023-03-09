import os
from flask import Flask
from views import views
<<<<<<< HEAD
from flask_cors import CORS
=======
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8

temp_dir = os.path.abspath("../client/html")
stat_dir = os.path.abspath("../client/static")

<<<<<<< HEAD
app = Flask(__name__, template_folder=temp_dir, static_folder=stat_dir)
app.register_blueprint(views, url_prefix="/")

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

if(__name__ == "__main__"):
    app.run(debug=True)
=======
app = Flask(__name__, template_folder = temp_dir, static_folder = stat_dir)
app.register_blueprint(views, url_prefix = "/")

if(__name__ == "__main__"):
    app.run(debug=True, port=80)
>>>>>>> 05fcb1cfc319d7c78797c18676d155fa862fb8b8
