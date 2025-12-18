from flask import Flask, render_template

app = Flask(__name__)

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/style")
def style():
    return render_template("style.html")

@app.get("/closet")
def closet():
    return render_template("closet.html")

@app.get("/favorites")
def favorites():
    return render_template("favorites.html")

@app.get("/profile")
def profile():
    return render_template("profile.html")


if __name__ == "__main__":
    app.run(debug=True)
