from bottle import Bottle, run, template, static_file, request
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

@app.route('/data/new', method='post')
def newdata():
    udata = request.json
    print udata
    # store data
    return 'success'

run(app, host='0.0.0.0', port=8080)