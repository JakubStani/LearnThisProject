#In this file website's routes are stored 
#(except login site which belongs to file responsible for authenticetion)

from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for, session
    #this file is a blueprint of application
    #= it defines routes, it allows to have views in many files
    #(organised code)
from flask_login import login_required, current_user
#from .models import Note
from .models import Kit, Term
from . import db    
import json


#blueprint set up for application
views=Blueprint("views", __name__)

def create_list_of_dict_terms(nondict_terms):
        
    #adding kits terms to the session
    terms=[]
    for term in nondict_terms:
        terms.append(term.term_to_dict())
    
    return terms

@views.route("/learning-kits", methods=["GET", "POST"])
@login_required
def learning_kits():

    if request.method=="POST":
        kit=request.form.get("kit")

        if kit:
            is_kits_name_unique=True
            
            #checking, whether there is a kit with the same name
            for stored_kit in current_user.kits:
                if stored_kit.name==kit:
                    is_kits_name_unique=False
                    break

            if is_kits_name_unique:
                new_kit=Kit(name=kit, user_id=current_user.id, test_configuration="Ask for definition")
                db.session.add(new_kit)
                db.session.commit()
                flash("Kit has been added", category="success")
            
            else:
                flash("You can not have many kits with the same name", category="error")
        else:
            flash("You can not have kit with empty name", category="error")

    return render_template("learning_kits.html", user=current_user)

@views.route("/kits-content", methods=["GET", "POST"])
@login_required
def kits_content():

    if request.method=="POST":
        kit=json.loads(request.data)
        kitId=kit["kitId"]

        kit=Kit.query.get(kitId)

        session["last_entered_kits_id"]=kit.id
        session["last_entered_kits_name"]=kit.name
        session["last_entered_kits_test_config"]=kit.test_configuration

        #adding kits terms to the session
        session["last_entered_kits_terms"]=create_list_of_dict_terms(kit.terms)

        if not kit:
            flash("This kit is not found", category="error")
            return redirect(url_for("views.learning_kits"))
        

    kits_names=[]
    for kit in current_user.kits:
        if kit.name!=session.get("last_entered_kits_name"):
            kits_names.append(kit.name)

    session["kit_names_other_than_last_kit"]=kits_names

    return render_template(
        "kits_content.html", 
        user=current_user, 
        kit_id=session.get("last_entered_kits_id"), 
        kit_name=session.get("last_entered_kits_name"),
        kit_test_config=session.get("last_entered_kits_test_config"), 
        kit_terms=session.get("last_entered_kits_terms"), 
        kit_names=session.get("kit_names_other_than_last_kit")
        #terms_to_add=[]
        )

@views.route("/")
def about_learn_this():
    return render_template("about_learn_this.html", user=current_user)

@views.route("/learning", methods=["GET"])
@login_required
def learning():
    if request.method=="GET":

        return render_template(
            "learning.html", 
            kit_id=session["last_entered_kits_id"], 
            kit_name=session["last_entered_kits_name"], 
            kit_config=session["last_entered_kits_test_config"],
            terms=session.get("last_entered_kits_terms"),
            user=current_user
            )



#operation related routes

@views.route("/delete-kit", methods=["POST"])
@login_required
def delete_kit():
    kit=json.loads(request.data)
    kitId=kit["kitId"]
    kit=Kit.query.get(kitId)

    if kit:
        if kit.user_id==current_user.id:
            db.session.delete(kit)
            db.session.commit()
        else:
            flash("This kit does not belong to you. Removing impossible", category="error")
    else:
        flash("Kit not found. Removing impossible", category="error")

    return jsonify({})

@views.route("/delete-term", methods=["POST"])
@login_required
def delete_term():
    term=json.loads(request.data)
    terms_id=term["terms_to_delete"]
    if len(terms_id)>0:
        for termId in terms_id:
            term=Term.query.get(termId)

            if term:
                terms_kit=Kit.query.get(term.kit_id)
                if terms_kit:
                    if terms_kit.user_id==current_user.id:
                        
                        #deleting from session
                        session["last_entered_kits_terms"].remove(term.term_to_dict())

                        db.session.delete(term)
                        db.session.commit()
                        flash("Term has been deleted", category="success")
                    else:
                        flash("This terms does not belong to you. Removing impossible", category="error")
                        break
                else:
                    flash("This term does not belong to any kit. Removing impossible", category="error")
                    break
            else:
                flash("Term not found. Removing impossible", category="error")
                break

    return jsonify({})

@views.route("/add-term", methods=["POST"])
@login_required
def add_term():
    term_from_req=request.form.get("term_to_create_cont")

    is_term_content_unique=True

    terms_kit=Kit.query.get(session.get("last_entered_kits_id"))

    for term in terms_kit.terms:
        if term.content==term_from_req:
            is_term_content_unique=False
            break
    
    if not is_term_content_unique:
        flash("You can not have many terms with the same content", category="error")

    else:
        term_def=request.form.get("term_to_create_def")
        new_term=Term(content=term_from_req, definition=term_def, kit_id=terms_kit.id)
        db.session.add(new_term)
        db.session.commit()
        flash("Term has been added", category="error")

        #updating terms
        if "last_entered_kits_terms" in session:
            session.get("last_entered_kits_terms").append(new_term.term_to_dict())
        else:        
            session["last_entered_kits_terms"]=[new_term.term_to_dict()]

    return redirect(url_for("views.kits_content"))

@views.route("/save-term-edit-changes", methods=["POST"])
@login_required
def save_term_edit_changes():
    term=json.loads(request.data)
    terms_kit=term["kit_id"]
    terms_kit_new_name=term["kits_new_name"]
    terms_kit_test_new_config=term["kits_test_new_config"]
    terms_id=term["terms_id"]
    terms_content=term["terms_content"]
    terms_definition=term["terms_definition"]
    new_added_cont=term["new_added_cont"]
    new_added_def=term["new_added_def"]
    isError=False

    print("terms_id:", terms_id)
    print("terms_content:", terms_content)
    print("terms_definition:", terms_definition)

    terms_kit=Kit.query.get(terms_kit)
    if terms_kit:

        #updating kit's name and config
        terms_kit.name=terms_kit_new_name
        session["last_entered_kits_name"]=terms_kit.name

        terms_kit.test_configuration=terms_kit_test_new_config
        session["last_entered_kits_test_config"]=terms_kit.test_configuration

        new_terms=[]

        #updating terms
        for term_id, term_content, term_definition in zip(terms_id, terms_content, terms_definition):

            term=Term.query.get(term_id)
            if term:
                if term.kit_id==terms_kit.id:
                    if terms_kit.user_id==current_user.id:  
                        
                        #updating term
                        term.content=term_content
                        term.definition=term_definition
                        db.session.commit()
                        new_terms.append(term.term_to_dict())

                    else:
                        flash("This terms does not belong to you. Edition impossible", category="error")
                        isError=True
                        break
                else:
                    flash(f"Term \"{term.content}\" does not belong to kit \"{terms_kit.name}\". Edition impossible", category="error")
                    isError=True
                    break
            else:
                flash(f"Term \"{term_content}\" not found. Edition impossible", category="error")
                isError=True
                break
        
        #adding new terms
        for cont, defin in zip(new_added_cont, new_added_def):

            created_term=Term(
                content=cont, 
                definition=defin, 
                kit_id=terms_kit.id
                )
            
            db.session.add(created_term)
            new_terms.append(created_term)
        db.session.commit()

        session["last_entered_kits_terms"]=create_list_of_dict_terms(terms_kit.terms)

        if isError:
            flash("Some troubles appeared. Not every change has been saved", category="error")
        else:
            flash("Kit's content have been saved", category="success")
    else:
        flash(f"Kit not found. Edition impossible", category="error")
        isError=True

    return jsonify({})


    
    