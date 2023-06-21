from flask import Blueprint, render_template, request, flash, redirect, url_for, session
from .models import User
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from flask_login import login_user, login_required, logout_user, current_user
from validate_email_address import validate_email

#blueprint set up for application
auth=Blueprint("auth", __name__)

@auth.route("/sign-up", methods=["GET", "POST"])
def sign_up():
    
    #if it is a POST request
    if request.method=="POST":

        #getting data from request
        email=request.form.get("email")
        nickname=request.form.get("nickname")
        password1=request.form.get("password1")
        password2=request.form.get("password2")
        #password2=request.form.get("password2")

        #making a query to database named "User", whether it already has a user with provided email
        user = User.query.filter_by(email=email).first()

        #if this user already exists
        if user:
            flash("Provided email already belongs to other account", category="error")


        elif not validate_email(email, check_mx=True):
            flash("Provided email does not exist", category="error")
        elif nickname=="":
            flash("Nickname cannot be empty", category="error")
        elif password1=="":
            flash("Password cannot be empty", category="error")
        elif password1!=password2:
            flash("Passwords are different", category="error")
        elif nickname=="":
            flash("Nickname cannot be empty", category="error")
        elif User.query.filter_by(nickname=nickname).first():
            flash("Provided nickname already belongs to other account", category="error")
            
        #if user does not exist yet-> ADD SIGNING LIMITATIONS!!!!
        else:
            #data validation-> ADD THAT (if, elif, elif ..., else), flash- flashes a message to a user !!!!!!!
            #creating account
            new_user=User(email=email, nickname=nickname, password=generate_password_hash(password1, method="scrypt"))

            #adding user to the database
            db.session.add(new_user)
            db.session.commit()
            flash("Account created", category="success")

            #storing information that user is logged in
            login_user(new_user, remember=True)

            #redirecting user
            #url_for finds URL that relates to views.home_page function; if this URL change, above instruction will still work
            return redirect(url_for("views.learning_kits"))
    return render_template("sign_up.html", user=current_user)

@auth.route("/login", methods=["GET", "POST"])
def login():
    
    if request.method=="POST":
        email=request.form.get("email")
        password=request.form.get("password")

        #making a query to database named "User", whether it has a user with provided email
        user = User.query.filter_by(email=email).first()

        #if user is found
        if user:
            #checking whether provided password is correct
            if check_password_hash(user.password, password):

                #login is successful
                flash("Logged in successfully", category="success")

                #storing information that user is logged in
                login_user(user, remember=True)

                #redirecting user
                return redirect(url_for("views.learning_kits"))
            
            #if password was wrong
            else:
                flash("Invalid password", category="error")
        
        #if user does not exist
        else:
            flash("Email does not exist", category="error")

    return render_template("login.html", user=current_user)

@auth.route("/logout")
@login_required
def logout():

    #clearing session
    if "last_entered_kits_id" in session:
        session.pop("last_entered_kits_id")

    if "last_entered_kits_name" in session:
        session.pop("last_entered_kits_name")
    
    if "last_entered_kits_terms" in session:
        session.pop("last_entered_kits_terms")

    #logging out user
    logout_user()

    #redirecting user
    return redirect(url_for("auth.login"))