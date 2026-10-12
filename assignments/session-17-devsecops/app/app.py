"""Simple calculator web app used for the CI/CD demo."""
from flask import Flask, jsonify

app = Flask(__name__)


def add(a, b):
    return a + b


def subtract(a, b):
    return a - b


def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


@app.route("/")
def index():
    return "<h1>CI/CD Calculator API</h1><p>Try /add/2/3</p>"


@app.route("/add/<int:a>/<int:b>")
def add_route(a, b):
    return jsonify(result=add(a, b))


@app.route("/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
