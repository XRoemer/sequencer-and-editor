
// load_scripts_otf({fkt:'mfp',scripts:['midi/Notes','midi/midi-file-parser'],args:[file,0]})

function load_scripts_otf(args){
  var loaded = 0

  for (i = 0; i < args.scripts.length ; i++) {
    var name = args.scripts[i]

    if (document.getElementById(name)){
      var elem = document.getElementById(name)
      elem.parentNode.removeChild(elem);
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = name + '.js';
    script.id = name

    script.onload = function(e) {
      loaded += 1
      // on all scripts loaded, the function will be executed
      if (loaded == args.scripts.length){
        window[args.fkt](args.args)
      }
    };
    document.body.appendChild(script);
  }
}

function open_win(x,y,w,h,name,path,fkt){
  var left, top, width, height, _path

  left = x ? ' left=' + x : 'left=700'
  top = y ? ',top=' + y : ',top=300'
  width = w ? ',width=' + w : ',width=410'
  height = h ? ',height=' + h : ',height=260'
  _path = path ? path : 'index.html'
  var args = left + top + width + height

  var win = window.open(_path,'_blank', args);
  if (name) {window[name] = win; win.document.title = name}
  if (fkt) {win.addEventListener('load', fkt, false)}

  // get window id to be able to set it to front
  // it's a hack for win.focus(), which doesn't work
  chrome.windows.getLastFocused(function(wind) {
    win.id = wind.id
  });  
  return win
}

//function resize_window(win, w, h){
//  var h_dif = win.outerHeight - win.innerHeight
//  var w_dif = win.outerWidth - win.innerWidth
//  log({w,w_dif,h,h_dif,win})
//  win.resizeTo(w + w_dif, h + h_dif)
//}


function dict_to_arr(dict) {
  var tmp = []
  var keys = Object.keys(dict).sort()
  for (var i = 0; i < keys.length; i++) {
    tmp.push(dict[keys[i]])
  }
  return tmp
}
