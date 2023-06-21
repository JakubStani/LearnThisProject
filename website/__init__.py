from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager

#defining database
db=SQLAlchemy()
DB_NAME="database.db"
db_path=path.join(path.dirname(__file__), DB_NAME)

#creating application instance
def create_app():
    app=Flask(__name__, static_folder="static")

    #setting secret key
    app.config["SECRET_KEY"]="asknw3fvg:S!0O;/D#rw"

    #setting database (it is located at the location: sqlite:///{DB_NAME})
    app.config["SQLALCHEMY_DATABASE_URI"]=f"sqlite:///{db_path}"

    #initializing database by giving it our flask app (telling db which app's data will it store)
    db.init_app(app)

    from .views import views
    from .auth import auth

    #registering blueprints
    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(views, url_prefix="/")

    from .models import User, Kit, Term    #, Note

    with app.app_context():
        create_database()

    login_manager=LoginManager()
    login_manager.login_view= "auth.login" #it tells where flask should redirect users, when they are not logged in
    login_manager.init_app(app)

    #it tells flask how we load the user/what function should it use to load the user
    # -> this function looks for user with specific id
    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id)) 

    return app

#checking whether any database has already been created
def create_database():
    
    if not path.exists(db_path):

        #we tell for which app we want database to be created
        db.create_all()
        print("created database")