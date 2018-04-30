// Load native UI library
var gui = require('nw.gui')

function init(){
  // check if nw is already started
  // if not, start tcp connection
  if (!window.parent_Win){
    var nr = gui.App.argv[0]
    load_scripts_otf({fkt:'load_tcp',scripts:['TCP'],args:[nr]})
    window.document.title = 'Sequencer ' + nr
    open_windows[nr] = this
    window.win_nr = nr
  }
  player = new Player()
  player.create_player()
  create_ctrl()

}

function open_new_sequencer_window(nr) {
  var x = 700
  var y = 300
  var w = 390
  var h = 220
  var path = 'index.html'
  var name = 'Sequencer ' + nr

  var win = open_win(x,y,w,h,name,path)

  win.parent_Win = window
  win.addEventListener('load', function(e) {
        win.document.title = name
        win.win_nr = nr
        win['open_windows'] = open_windows
        win.tcp = tcp
        open_windows[nr] = win
        log(name)
      }, false);
}

function clear_all() {

  selected_item  = null
  selected_item_se  = null
  dragging = false
  drag_start = false
  drag_end = false
  dragging_startend = false
  drag_y_tmp = 0
  items = {}
  items_by_row = {}

  sequencer.innerHTML = ''
  sequencer_bg.innerHTML = ''
  div_scale_y.innerHTML = ''
  div_scale_x.innerHTML = ''
  loop_bounds_div.innerHTML = ''

  var cnv = document.createElement("canvas");
  cnv.id = "seq_div_extend";
  cnv.height = win_h + 1
  cnv.width = win_w + 2
  cnv.style.position = 'absolute'

  sequencer.appendChild(cnv);

  var cnv = document.createElement("canvas");
  cnv.id = "scale_x_bg";
  cnv.height = 20
  cnv.left = -40

  div_scale_x.appendChild(cnv);

  var cnv = document.createElement("canvas");
  cnv.id = "scale_y_bg";
  cnv.height = 20
  cnv.width = 40

  div_scale_y.appendChild(cnv);
}

function clear_sequencer() {
  selected_item  = null
  selected_item_se  = null
  dragging = false
  drag_start = false
  drag_end = false
  dragging_startend = false
  drag_y_tmp = 0
  items = {}
  items_by_row = {}

  document.getElementById('sequencer').innerHTML = ''
  var cnv = document.createElement("canvas");
  cnv.id = "seq_div_extend";
  cnv.height = win_h + 1
  cnv.width = win_w + 2
  cnv.style.position = 'absolute'
  document.getElementById('sequencer').appendChild(cnv);
  log('cleared')
}

function set_var(val) {

  if (val.length > 1) {
    name = val[0].trim()
    if (name === 'elem_cols') {
      elem_cols[Number(val[1])] = [Number(val[2]), Number(val[3]), Number(val[4])]
    }
    else if (name === 'win_size') {
      win_w = Number(val[1])
      win_h = Number(val[2])
    }
    else {
      window[val[0]] = Number(val[1])
      }
    }
  }

function create_seqgui() {

  clear_all()

  try {
    set_widths_and_heights()

    var c=document.getElementById("canvas_bg");
    c.height = win_h + 1
    c.width = win_w + 2
    c=document.getElementById("canvas_ctrl");
    c.style.width = win_w + 42
    var ctx = c.getContext('2d')
    ctx.fillStyle = 'rgba(245, 245, 215, 1)'
    ctx.fillRect(0,0, c.width, c.height)
    c=document.getElementById("sequencer_bg");
    c.height = win_h + 1
    c.width = win_w + 2
    c=document.getElementById("seq_div_extend");
    c.height = win_h + 1
    c.width = win_w + 2
    c=document.getElementById("sequencer");
    c.height = win_h + 1
    c.width = win_w + 2
    if (!initialized) {
      add_listeners_to_cnv(c)
      }
    c=document.getElementById("div_scale_y");
    c.style.height = win_h
    c=document.getElementById("div_scale_x");
    c.style.width = win_w +2

    c=document.getElementById("scale_x_bg");
    c.width = win_w + 2
    ctx = c.getContext('2d')
    ctx.fillStyle = 'rgba(220, 215, 215, 1)'
    ctx.fillRect(0,0, c.width, c.height)

    c=document.getElementById("scale_y_bg");
    c.height = win_h
    c.width = 40
    ctx = c.getContext('2d')
    ctx.fillStyle = 'rgba(220, 215, 215, 1)'
    ctx.fillRect(0,0, c.width, c.height)

    c=document.getElementById("top_left");
    ctx = c.getContext('2d')
    ctx.fillStyle = 'rgba(220, 215, 215, 1)'
    ctx.fillRect(0,0, c.width, c.height)

    c=document.getElementById("player_bg");
    c.width = win_w + 42
    ctx = c.getContext('2d')
    ctx.fillStyle = 'rgba(160,140, 140, 1)'
    ctx.fillRect(0,0, c.width, c.height)


    resize_window(window, window_w , window_h)

    create_h_lines_bg()
    create_h_lines()
    create_v_lines()
    create_scale_y()
    create_scale_x()
    pointer = new Pointer()
    pointer.create_pointer()
    player2 = new Player()

    set_quantisation()
    initialized = true

  } catch(err) {
    log(err)
  }
  log('created sequencer gui')
}

function set_widths_and_heights() {
  elem_w = win_w / amount_bars / micro
  var q = use_triplets ? quant + quant / 2 : quant
  var cents = 100 / (q/4)
  quant_cents = Array.from({length: q/4}, (x,i) => i * cents);
  item_w = win_w / amount_bars / micro / q * 4
  elem_h = win_h / amount_rows
  barlen = win_w / amount_bars
  miclen = barlen / micro
}

function create_h_lines(){
  for (i = 0; i < amount_rows + 1; i++) {
    y = i * elem_h
    // to get sharp lines, xy-values must not be plain integers
    y = Math.trunc(y) + 0.5
    create_stroke(0,y,win_w,y,0.3,'rgb(0, 0, 0)')
  }
}

function create_v_lines(){
  for (i = 0; i < amount_bars * micro + 1; i++) {
    x = i * elem_w
    // to get sharp lines, xy-values must not be plain integers
    x = Math.trunc(x) + 0.5
    if (i % micro === 0) {
      stroke_w = 1.5
    }
    else {stroke_w = 0.5}
    create_stroke(x, 0, x, win_h, stroke_w,'rgb(0, 0, 0)')
  }
}

function set_quantisation(){
  var div = document.getElementById('sequencer_bg')
  div.innerHTML = ''

  if (quant < 8) return

  var q = quant / 4 - 1
  use_triplets ? q += q/2 : q

  for (i = 0; i < amount_bars * micro  ; i++) {
    x = i * elem_w
    // to get sharp lines, xy-values must not be plain integers
    x = Math.trunc(x) + 0.5

    stroke_w = 1
    for (j = 0; j < q ; j++) {
      var x2 = Math.trunc(x + j * item_w + item_w) + 0.5
      var id = 'q' + i.toString()
      var stroke = create_stroke_svg(x2, 0, stroke_w, win_h, stroke_w,'rgb(255, 0, 0)',id)
      div.appendChild(stroke)
    }
  }
}

function create_h_lines_bg(){
  for (i = 0; i < amount_rows; i++) {
    y = win_h - (i ) * elem_h - 0.5 * elem_h
    // to get sharp lines, xy-values must not be plain integers
    y = Math.trunc(y) + 0.5
    col = get_bg_layout_col(i)
    create_stroke(0, y, win_w, y, elem_h, col)
  }
}

function get_bg_layout_col(i){
  _list = line_layouts[line_design]
  len = _list.length
  pos = _list[i % len]
  if (pos == -1) {
    col = 'rgb(230, 230, 230)'
  }
  else {col = 'rgb(255, 255, 255)'}
  return col
}

function create_scale_y(){
  var c = document.getElementById("div_scale_y");
  for (i = 0; i < amount_rows ; i++) {
    y =  win_h - (i + 1) * elem_h //- 1
    txt = i+1
    lbl = create_label_scale_y (18, y ,txt.toString(),Math.min(elem_h - 4, 18) )
    c.appendChild(lbl)
  }
}

function create_label_scale_y (x,y,txt,font_size, id) {
  var newlabel = document.createElement("LABEL");
  //newlabel.style.left = x.toString() + 'px'
  newlabel.style.top = y.toString() + 'px'
  newlabel.style.position = "absolute"
  newlabel.style.width = 35
  newlabel.innerHTML = txt;
  newlabel.style.display = 'block'
  newlabel.style.fontSize = font_size.toString() + 'px'
  newlabel.style.textAlign = 'right'
  return newlabel
}

function create_scale_x(){
  var c = document.getElementById("div_scale_x");
  for (i = 0; i < amount_bars * micro ; i++) {
    x = i * elem_w
    // to get sharp lines, xy-values must not be plain integers
    x = Math.trunc(x)
    if (i % micro === 0) {
      stroke_w = 2
      stroke_h = 10
      fs = 12
      hight = 20 - fs
    }
    else {
      stroke_w = 0.5
      stroke_h = 15
      fs = 10
      hight = 20 - fs
    }
    var str = create_stroke_svg(x, hight, stroke_w, fs, stroke_w, 'black', 'cnv_scale_x')
    c.appendChild(str)
    mic = i % micro + 1
    bar = Math.trunc(i / micro) + 1
    txt = bar.toString() + '.' + mic.toString()
    lbl = create_label (x + 4, hight - 1 ,txt, fs )
    c.appendChild(lbl)
  }
}


function get_scroll(){
 if(window.pageYOffset!= undefined){
  return [pageXOffset, pageYOffset];
 }
 else{
  var sx, sy, d= document, r= d.documentElement, b= d.body;
  sx= r.scrollLeft || b.scrollLeft || 0;
  sy= r.scrollTop || b.scrollTop || 0;
  return [sx, sy];
 }
}
