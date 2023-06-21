#in this file database models are defined

#"." means current package; user objects will inherit from UserMixin
from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func
from sqlalchemy import Enum
import enum

class Term(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content=db.Column(db.String[10000])
    definition=db.Column(db.String[10000])
    kit_id=db.Column(db.Integer, db.ForeignKey("kit.id", ondelete="CASCADE"))

    def term_to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "definition": self.definition,
            "kit_id": self.kit_id
        }

class Kit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(150))
    test_configuration=db.Column(db.String(40))
    terms=db.relationship("Term", cascade="all, delete")
    user_id=db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    nickname = db.Column(db.String(150), unique=True)
    kits=db.relationship("Kit", cascade="all, delete")