import os
from flask import Flask
from views import views

temp_dir = os.path.abspath("client/html")
stat_dir = os.path.abspath("client/static")

app = Flask(__name__, template_folder = temp_dir, static_folder = stat_dir)
app.register_blueprint(views, url_prefix = "/")

if(__name__ == "__main__"):
    app.run(debug=True)