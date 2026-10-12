# Simple Python (Flask) web server that shows Hello World
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return """
    <html>
      <head><title>Python App</title></head>
      <body style="font-family: sans-serif; text-align:center; padding-top:80px; background:#f6f8fa;">
        <h1 style="color:#306998;">Hello World from Python (Flask) 🐍</h1>
        <p>Running inside a Docker container on port 5000</p>
      </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
