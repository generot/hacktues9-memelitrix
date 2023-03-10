from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def index():
    return "<p>Hello, world</p>"

@app.route("/smth", methods=["POST"])
def smth():
    data = request.get_data()
    print(data)

    return "OK"

if __name__ == "__main__":
    app.run(port=80)


