import os
from flask import Flask
from views import views
from flask_cors import CORS
from pywebpush import webpush, WebPushException

temp_dir = os.path.abspath("../client/html")
stat_dir = os.path.abspath("../client/static")

app = Flask(__name__, template_folder=temp_dir, static_folder=stat_dir)
app.register_blueprint(views, url_prefix="/")

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

if(__name__ == "__main__"):
    app.run(port=80, debug=True)
