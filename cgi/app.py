from bottle import Bottle, run, template, static_file
import configure as conf
 
app = Bottle()

buf = {}

web_dir = '../web'

@app.route('/<filetype:re:(css|js|image|lib)>/<filename>')
def static_web(filetype, filename):
    return static_file(filename, root=web_dir + '/' + filetype)

@app.route('/home')
def home():
    global buf
    buf_key = 'home'
    if not buf.has_key(buf_key):
        with open(web_dir + '/html/home.html') as f:
            buf[buf_key] = template(f.read(), API_KEY=conf.read('google_map_api_key'))
    return buf[buf_key]

@app.route('/newdata', method='post')
def newdata():
    pass

run(app, host='localhost', port=8080)