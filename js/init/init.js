// Load native UI library
var gui = require('nw.gui')
last_seq_dragging_pos = [0,0,0,0]


function init(){
  // check if nw is already started
  // if not, start tcp connection
  if (!window.parent_Win){
    var nr = gui.App.argv[0]
    load_scripts_otf({fkt:'load_tcp',scripts:['tools/TCP'],args:[nr]})
    window.document.title = 'Sequencer ' + nr
    open_windows[nr] = this
    window.win_nr = nr
  }
  player = new Player()
  player.create_player()
  create_ctrl()
  create_seqgui()
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

  clear_vars()

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

function clear_vars(){
  selected_item  = null
  selected_item_se  = null
  dragging = false
  drag_start = false
  drag_end = false
  dragging_startend = false
  drag_y_tmp = 0
  items = {}
  items_by_row = {}
}

function clear_sequencer() {
  clear_vars()

  document.getElementById('sequencer').innerHTML = ''
  var cnv = document.createElement("canvas");
  cnv.id = "seq_div_extend";
  cnv.height = win_h + 1
  cnv.width = win_w + 2
  cnv.style.position = 'absolute'
  document.getElementById('sequencer').appendChild(cnv);
  add_listener_to_seq()
  log('cleared')
}


function create_seqgui() {

  clear_all()

  try {
    set_widths_and_heights()
    setup_divs()
    
    if (!initialized) {
      add_listeners_to_cnv(document.getElementById("sequencer"))
      }
    
    resize_window(window, window_w , window_h)

    create_h_lines_bg()
    create_h_lines()
    create_v_lines()
    create_scale_y()
    create_scale_x()
    pointer = new Pointer()
    pointer.create_pointer()
    player = new Player()
    player.init()

    set_quantisation()
    initialized = true
    add_listener_to_seq()

  } catch(err) {
    log(err)
  }
}

function setup_divs(){
  
  var elements = [
    ["canvas_bg",	[win_w + 2, 	win_h + 1], null],
    ["canvas_ctrl",	[win_w+2+scaleY_w,ctrl_h], 'rgba(245, 245, 215, 1)'],
    ["sequencer_bg",	[win_w + 2,	win_h + 1], null],
    ["seq_div_extend",[win_w + 2,	win_h + 1], null],
    ["sequencer",	[win_w + 2,	win_h + 1], null],     
    ["div_scale_y",	[scaleY_w,	win_h + 1], null],
    ["div_scale_x",	[win_w + 2,	scaleX_h], null],
    ["scale_y_bg",	[scaleY_w,	win_h + 1], 'rgba(220, 215, 215, 1)'],
    ["scale_x_bg",	[win_w + 2,	scaleX_h], 'rgba(220, 215, 215, 1)'], 
    ["player_bg",	[win_w+2+scaleY_w,player_h], 'rgba(160,140, 140, 1)'],
    ["top_left",	[scaleY_w,	scaleX_h], 'rgba(220, 215, 215, 1)'], 
  ]
  
  var c
  for(var i = 0; i < elements.length; i++){
    c=document.getElementById(elements[i][0]);
    c.width = elements[i][1][0]
    c.height = elements[i][1][1]
    if (elements[i][2]) {
      var ctx = c.getContext('2d')
      ctx.fillStyle = elements[i][2]
      ctx.fillRect(0,0, c.width, c.height)
    }
  }
}


function add_listener_to_seq(){
  seq_div_extend.addEventListener("mousedown", function(e) {
    seq_dragging = true
    seq_dragstart = [e.offsetX,e.offsetY]
    }, false);

  seq_div_extend.addEventListener("mouseup", function(e) {
    seq_dragging = false
    }, false);

  seq_div_extend.addEventListener("mousemove", function(e) {
    if(seq_dragging) {}

      var pos = posX2midi_quant(e.offsetX - item_w / 2)
      var bar = pos.bar
      var micro = pos.micro
      var cent = pos.cent
      var row = posY2row(e.offsetY)

      var same = [row,bar,micro,cent].every(function(element, index) {
          return element === last_seq_dragging_pos[index];
      })
      if(same == false && ctrl_pressed && shift_pressed){
        var x = (bar -1) * barlen + (micro - 1) * miclen + cent/100 * miclen
        var y = (amount_rows - row - 1) * elem_h
        create_new_item(null, x, y)

      last_seq_dragging_pos = [row,bar,micro,cent]
    }
  }, false);
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
    //var stroke = create_stroke_svg(x2, 0, stroke_w, win_h, stroke_w,'rgb(0, 0, 0)',id)
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
    x = Math.trunc(x) //+ 0.5

    var stroke_w = 1
    for (j = 0; j < q ; j++) {
      var x2 = Math.trunc(x + j * item_w + item_w) //+ 0.5
      var id = 'q' + i.toString()
      var stroke = create_stroke_svg(x2, 0, stroke_w, win_h, stroke_w,'rgb(255, 0, 0)',id)
      div.appendChild(stroke)
    }
  }
}


function get_bg_layout_col(i){
  _list = line_layouts[line_design]
  len = _list.length
  pos = _list[i % len]
  if (pos == -1) {
    col = 'rgb(200, 200, 200)'
  }
  else {col = 'rgb(250, 250, 250)'}
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
    var x = i * elem_w
    x = Math.trunc(x)
    if (i % micro === 0) {
      var stroke_w = 2
      stroke_h = 10
      var fs = 12
      var hight = 20 - fs
    }
    else {
      var stroke_w = 0.5
      var stroke_h = 15
      var fs = 10
      var hight = 20 - fs
    }
    var str = create_stroke_svg(x, hight, stroke_w, fs, stroke_w, 'black', 'cnv_scale_x' + i)
    c.appendChild(str)
    var mic = i % micro + 1
    var bar = Math.trunc(i / micro) + 1
    var txt = bar.toString() + '.' + mic.toString()
    var lbl = create_label (x + 4, hight - 1 ,txt, fs , 'scale_lbl' + i)
    c.appendChild(lbl)
  }
}

function scale_seqgui() {
  set_widths_and_heights()
  setup_divs()
  create_h_lines_bg()
  create_h_lines()
  create_v_lines()
  set_quantisation()
  scale_scale_x()
  scale_items()
}

function scale_scale_x(){
  for (i = 0; i < amount_bars * micro ; i++) {
    var x = i * elem_w
    x = Math.trunc(x)
    if (i % micro === 0) {
      var stroke_w=2, stroke_h=10, fs=12, hight=20 - fs
    }
    else {
      var stroke_w=0.5, stroke_h=15, fs=10, hight=20 - fs
    }
    div_scale_x.children['cnv_scale_x' + i].style.left = x
    div_scale_x.children['scale_lbl' + i ].style.left = x + 4
  }
}


function scale_items() {
  
  var keys = Object.keys(items)
  var n = function(a,b){return Number(items[a].info[b])}

  for (var k = 0; k < keys.length ; k++) {
    var i = keys[k]
    var rect1 = items[i] 

    var id = n(i,'id')
    var row = n(i,'row')
    var bar = n(i,'bar') - 1
    if (row > amount_rows - 1 || bar > amount_bars - 1) continue
    var micro = n(i,'micro') - 1
    var cent = n(i,'cent')
    var len_bar = n(i,'len_bar')
    var len_micro = n(i,'len_micro')
    var len_cent = n(i,'len_cent')

    var x = midi2posX(bar, micro, cent)
    var w = midi2posX(len_bar, len_micro, len_cent)

    rect1.info.x = x
    rect1.info.w = w
    rect1.style.width = w
    rect1.firstChild.style.width = w
    rect1.style.left = x
    items[i] = rect1
    
    for (var j = 0; j < items_by_row[row].length ; j++) {
      if (parseInt(items_by_row[row][j][2]) == id){
        items_by_row[row][j][0] = x
        items_by_row[row][j][1] = x + w
      }
    }
  }
}
