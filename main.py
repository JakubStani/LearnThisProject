from website import create_app

#creating app instance
app=create_app()


if __name__=="__main__":
    #debug=True means that everytime Python code changes
    #the web content will be automaticly updated
    app.run(debug=True)