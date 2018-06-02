// Load native UI library
var nw_gui = require('nw.gui')

nw_gui.App.on('open', function (argString) {

  argString = argString.split(' ')
  var nr = argString[argString.length - 1]

  if (!open_windows[nr]) {
 // search for window with the lowest win_nr
    // to open a new window just once
    var wins = nw_gui.global.__nw_windows
    var keys = Object.keys(wins)
    var win_nrs = []
    keys.forEach(function(e) {
      win_nrs.push(wins[e][0].window.win_nr)
      })
    win_nrs.sort()
    var is_win_with_lowest_nr = window.win_nr == win_nrs[0].toString()
    if (is_win_with_lowest_nr) {
      log('opened sequencer',nr)
      open_new_sequencer_window(nr)
    }
  }
  else {
    // hack for not working window.focus()
    chrome.windows.update(open_windows[nr].id, {focused : true});
  }
});

function init(){
  // check if nw is already started
  // if not, start tcp connection
  log('init')
  if (!window.parent_Win){
    var nr = nw_gui.App.argv[0]
    load_scripts_otf({fkt:'load_tcp',scripts:['tools/TCP'],args:[nr]})
    window.document.title = 'Sequencer ' + nr
    open_windows[nr] = this
    window.win_nr = nr
    // used for a hack with window.focus()
    chrome.windows.getLastFocused(function(wind) {
      try{
        window.id = wind.id
      }
      catch(e) {log('error: no window')}
    });
  }
  items = new Items()
  params = new Parameters()
  pointer = new Pointer()
  pointer.create_pointer()
  player = new Player()
  player.create_player()
  player.init()
  gui.create_seqgui()
  main.create_main()
  gui.init_div_positions()
}


function open_new_sequencer_window(nr) {
  var x = 700
  var y = 300
  var path = 'index.html'
  var name = 'Sequencer ' + nr

  var win = open_win(x,y,V.window_w,V.window_h,name,path)
  win.parent_Win = window
  win.addEventListener('load', function(e) {
    win.document.title = name
    win.win_nr = nr
    win['open_windows'] = open_windows
    win.tcp = tcp
    open_windows[nr] = win
  }, false);
}

class Create_Gui {
  
  constructor(win){
    this.window = win
  }

  clear_all() {
    this.clear_gui()
    items.clear_vars()
    params.clear()
    val_array = []
  }
  
  clear_gui(){
    sequencer.innerHTML = ''
    sequencer_bg.innerHTML = ''
    div_scale_y.innerHTML = ''
    div_scale_x.innerHTML = ''
  
    var cnv = document.createElement("canvas");
    cnv.id = "scale_x_bg"
    div_scale_x.appendChild(cnv);
    
    var cnv = document.createElement("div");
    cnv.id = "div_solo_mute"
    cnv.setAttribute("class", 'scaleY')
    div_scale_y.appendChild(cnv);
    
    var cnv = document.createElement("canvas");
    cnv.id = "div_scale_y_numbers"
    cnv.setAttribute("class", 'scaleY')
    div_scale_y.appendChild(cnv);
    
    var cnv = document.createElement("canvas");
    cnv.id = "scale_y_bg"
    div_scale_y.appendChild(cnv);
  }
  
  clear_sequencer() {
    sequencer.innerHTML = ''
  }
  
  create_seqgui() {
  
    try {
      this.set_widths_and_heights()
      this.setup_divs()
  
      if (!initialized) {
        add_listeners_to_sequencer()
        }
  
      this.window.resizeTo(V.window_w , V.window_h)
  
      this.create_h_lines_bg()
      this.create_h_lines()
      this.create_v_lines()
      this.create_scale_y()
      this.create_scale_x()
      this.create_params()
  
      if(this.window.pointer) {
        pointer.stop_pointer()
      }
  
      this.set_quantisation()
      initialized = true
      setTimeout(function() {player.init()}, 250)
      gui.adjust_view()
      pointer.adjust_transport_stroke()
  
    } catch(err) {
      log(err)
    }
  }
  
  setup_divs(){
    
    V.scaleY_w = V.numbers_w + V.show_solo * V.solo_w
  
    var elements = [
      ["canvas_bg",	[V.win_w + 2, 	V.win_h + 1], null],
      ["sequencer_bg",	[V.win_w + 2,	V.win_h + 1], null],
      ["sequencer",	[V.win_w + 2,	V.win_h + 1], null],
      ["div_scale_y",	[V.scaleY_w,	V.win_h + 1], null],
      ["div_scale_x",	[V.win_w + 2,	V.scaleX_h],  null],
      ["canvas_main",	[V.win_w+2+V.scaleY_w, V.ctrl_h], V.main_bg_col],
      ["player_bg",	[V.win_w+2+V.scaleY_w,V.player_h], V.player_bg_col],
      ["top_left",	[V.scaleY_w,	V.scaleX_h], V.yAxis_bg_col],
      ["params_cnv",	[V.win_w + 2,	V.params_h], V.xAxis_bg_col],
      ["scale_x_bg",	[V.win_w + 2,	V.scaleX_h], V.xAxis_bg_col],
      ["scale_y_bg",	[V.solo_w,	V.win_h + 1],V.yAxis_bg_col],
    ]
    this.set_w_h_of_elements(elements)
  }
  
  adjust_view(){
    if(V.show_main){
      main_div.style.visibility = 'visible'
    } else main_div.style.visibility = 'hidden'

    if(V.show_player){
      player_div.style.visibility = 'visible'
      player_div.style.top = V.ctrl_h * V.show_main
    } else player_div.style.visibility = 'hidden'

    if(V.show_parameters){
      params_div.style.visibility = 'visible'
      params_div.style.top = V.ctrl_h * V.show_main + V.player_h * V.show_player + V.scaleX_h + V.win_h + 2
      params_div.style.height = V.params_h
      params_div.style.width = V.win_w
      
      this.redraw_cnv(params_cnv, V.win_w, V.params_h, V.xAxis_bg_col, 'visible')
      this.redraw_cnv(bottom_left_cnv, V.scaleY_w, V.params_h - 10, V.yAxis_bg_col, 'visible')
      this.redraw_cnv(params_drag, V.scaleY_w, 10,  V.yAxis_bg_col, 'visible')
      this.redraw_cnv(scale_y_bg, V.scaleY_w, V.win_h, V.yAxis_bg_col, 'visible')
      this.redraw_cnv(top_left, V.scaleY_w, V.scaleX_h, V.yAxis_bg_col, 'visible')

    } else {
      	params_div.style.visibility = 'hidden'
	params_div.style.height = 0
	params_div.style.top = 0
	this.redraw_cnv(params_cnv, V.win_w, 0, 'hidden')
	this.redraw_cnv(bottom_left_cnv, V.scaleY_w - 10, 0, 'hidden')
	this.redraw_cnv(scale_y_bg, V.scaleY_w, V.win_h, V.yAxis_bg_col, 'hidden')
	this.redraw_cnv(top_left, V.scaleY_w, V.scaleX_h, V.yAxis_bg_col, 'visible')
    }
    if(V.show_solo){
      this.redraw_cnv(scale_y_bg, V.scaleY_w, V.win_h + 1, V.yAxis_bg_col, 'visible')
      div_solo_mute.style.visibility = 'visible'
    } else {
      this.redraw_cnv(scale_y_bg, V.scaleY_w, V.win_h + 1, V.yAxis_bg_col, 'hidden')
      div_solo_mute.style.visibility = 'hidden'
    }

    seq_container.style.top = V.player_h * V.show_player + V.ctrl_h * V.show_main
    sequencer.style.top = V.scaleX_h
    sequencer_bg.style.top = V.scaleX_h
    canvas_bg.style.top = V.scaleX_h
    scales.style.top = V.ctrl_h * V.show_main + V.player_h * V.show_player
    transport.style.top = V.ctrl_h * V.show_main + V.player_h * V.show_player
    
    this.init_div_positions()
    if (V.show_parameters) params.set_items()
  }
  
  init_div_positions(){
    div_scale_x.style.left = V.scaleY_w
    div_scale_y.style.width = V.scaleY_w
    transport.style.left = V.scaleY_w
    seq_container.style.left = V.scaleY_w
    params_div.style.left = V.scaleY_w
    top_left_div.style.width = V.scaleY_w
    bottom_left_div.style.left = -V.scaleY_w
    bottom_left_div.style.width = V.scaleY_w
    params_drag.style.width = V.scaleY_w
    div_scale_y_numbers.style.left = V.show_solo * V.solo_w
  }
  
  redraw_cnv(cnv, w, h, col, vis){
    cnv.width  = w
    cnv.style.width = w
    cnv.height = h
    cnv.style.height = h
    cnv.style.visibility = vis
    var ctx = cnv.getContext("2d")
    ctx.fillStyle = col
    ctx.fillRect(0,0,w,h)
  }
  
  set_w_h_of_elements(elements){
    var c
    for(var i = 0; i < elements.length; i++){
      c=document.getElementById(elements[i][0]);
      c.width = elements[i][1][0]
      c.height = elements[i][1][1]
      c.style.width = elements[i][1][0]
      c.style.height = elements[i][1][1]
      if (elements[i][2]) {
        var ctx = c.getContext('2d')
        ctx.fillStyle = elements[i][2]
        ctx.fillRect(0,0, c.width, c.height)
      }
    }
  }
  
  
  
  set_widths_and_heights() {
    V.elem_w = V.win_w / V.amount_bars / V.micro
    var q = V.use_triplets ? V.quant + V.quant / 2 : V.quant
    var cents = 100 / (q/4)
    V.quant_cents = Array.from({length: q/4}, (x,i) => i * cents);
    V.item_w = V.win_w / V.amount_bars / V.micro / q * 4
    V.elem_h = V.win_h / V.amount_rows
    V.barlen = V.win_w / V.amount_bars
    V.miclen = V.barlen / V.micro
  }
  
  create_h_lines(){
    var y
    for (var i = 0; i < V.amount_rows + 1; i++) {
      y = i * V.elem_h
      // to get sharp lines, xy-values must not be plain integers
      y = Math.trunc(y) + 0.5
      sf.create_stroke(0,y,V.win_w,y,0.3,'rgb(0, 0, 0)')
    }
  }
  create_h_lines_bg(){
    var y, col
    for (var i = 0; i < V.amount_rows; i++) {
      y = V.win_h - (i ) * V.elem_h - 0.5 * V.elem_h
      // to get sharp lines, xy-values must not be plain integers
      y = Math.trunc(y) + 0.5
      col = this.get_bg_layout_col(i)
      sf.create_stroke(0, y, V.win_w, y, V.elem_h, col)
    }
  }
  
  create_v_lines(){
    var x, stroke_w
    for (var i = 0; i < V.amount_bars * V.micro + 1; i++) {
      x = i * V.elem_w
      // to get sharp lines, xy-values must not be plain integers
      x = Math.trunc(x) + 0.5
      if (i % V.micro === 0) {
        stroke_w = 1.5
      }
      else {stroke_w = 0.5}
      sf.create_stroke(x, 0, x, V.win_h, stroke_w,'rgb(0, 0, 0)')
    }
  }
  
  set_quantisation(){
    sequencer_bg.innerHTML = ''
  
    if (V.quant < 8) return
  
    var q = V.quant / 4 - 1
    V.use_triplets ? q += q/2 : q
    
    var x
    for (var i = 0; i < V.amount_bars * V.micro  ; i++) {
      x = i * V.elem_w
      x = Math.trunc(x)
  
      var stroke_w = 1
      for (var j = 0; j < q ; j++) {
        var x2 = Math.trunc(x + j * V.item_w + V.item_w) //+ 0.5
        var id = 'q' + i.toString()
        var stroke = sf.create_stroke_svg(x2, 0, stroke_w, V.win_h, stroke_w,'rgb(255, 0, 0)',id)
        sequencer_bg.appendChild(stroke)
      }
    }
  }
  
  
  get_bg_layout_col(i){
    var col
    var _list = V.line_layouts[V.line_design]
    var len = _list.length
    var pos = _list[i % len]
    if (pos == -1) {
      col = 'rgb(200, 200, 200)'
    }
    else {col = 'rgb(250, 250, 250)'}
    return col
  }
  
  create_scale_y(){
    div_scale_y_numbers.height = V.win_h + 1
    div_scale_y_numbers.width = V.numbers_w
    
    var ctx = div_scale_y_numbers.getContext('2d')
    ctx.fillStyle = V.yAxis_bg_col
    ctx.fillRect(0,0, V.numbers_w, V.win_h + 1)
    ctx.textAlign="right"
    ctx.fillStyle = 'black'
    ctx.textBaseline="middle"
      
    var y, txt, lbl, font_size, mid_pos
    font_size = Math.min(V.elem_h - 2, 15)
    mid_pos = V.elem_h / 2 - font_size / 2
    
    ctx.font= font_size + "px Verdana"
    sm.init()
    
    var solo_h =  Math.min(Math.min(font_size, 10),V.elem_h )
    
    for (var i = 0; i < V.amount_rows ; i++) {
      y =  V.win_h - (i + 1) * V.elem_h 
      txt = i+1
      ctx.fillText(txt.toString(), V.numbers_w - 1,y + V.elem_h / 2 )
      sm.create_solo_mute_btns(y + V.elem_h / 2 - solo_h / 2  , 10,solo_h, i)
    }
  }
  
  create_label_scale_y (x,y,txt,font_size, id) {
    var newlabel = document.createElement("LABEL");
    newlabel.style.top = y + 'px'
    newlabel.style.position = "absolute"
    newlabel.style.width = V.numbers_w
    newlabel.textBaseline="top"; 
    newlabel.innerHTML = txt;
    newlabel.style.display = 'block'
    newlabel.style.fontSize = font_size.toString() + 'px'
    newlabel.style.textAlign = 'center'
    dir(newlabel)
    return newlabel
  }
  
  create_scale_x(){
    
    div_scale_x.innerHTML = ''
      
    var cnv = document.createElement("canvas");
    cnv.id = "scale_x_bg";
    cnv.height = 20
    cnv.left = -V.scaleY_w
    div_scale_x.appendChild(cnv);
    
    var elements = [
      ["div_scale_x",	[V.win_w + 2,	V.scaleX_h], null],
      ["scale_x_bg",	[V.win_w + 2,	V.scaleX_h], 'rgba(220, 215, 215, 1)'],
    ]
    this.set_w_h_of_elements(elements)

    for (var i = 0; i < V.amount_bars * V.micro ; i++) {
      var x = i * V.elem_w
      x = Math.trunc(x)
      if (i % V.micro === 0) {
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
      
      var str = sf.create_stroke_svg(x, hight, stroke_w, fs, stroke_w, 'black', 'cnv_scale_x' + i)
      if (i > 0) div_scale_x.appendChild(str)
      var mic = i % V.micro + 1
      var bar = Math.trunc(i / V.micro) + 1
      var txt = bar.toString() + '.' + mic.toString()
      var lbl = sf.create_label (x + 4, hight - 1 ,txt, fs , 'scale_lbl' + i)
      div_scale_x.appendChild(lbl)
    }
  }
  
  create_params(){
    params_div.style.top = V.ctrl_h + V.player_h + V.scaleX_h + V.win_h
  }
  
  scale_seqgui() {
    this.set_widths_and_heights()
    this.setup_divs()
    this.create_h_lines_bg()
    this.create_h_lines()
    this.create_v_lines()
    this.set_quantisation()
    this.scale_scale_x()
    this.scale_items()
  }
  
  scale_scale_x(){
    var hide = false
    var vis = true
    if ( V.miclen < 20) hide = true
    
    for (var i = 1; i < V.amount_bars * V.micro ; i++) {
      var x = i * V.elem_w
      x = Math.trunc(x)
      if (hide) {
	vis = true
	if (i % 4 != 0) {
	  vis = false
	  }
	}
      if (vis){
        div_scale_x.children['cnv_scale_x' + i].style.left = x
        div_scale_x.children['scale_lbl' + i ].style.left = x + 4
        div_scale_x.children['cnv_scale_x' + i].style.visibility = 'visible'
        div_scale_x.children['scale_lbl' + i ].style.visibility = 'visible'
      }
      else{
	div_scale_x.children['cnv_scale_x' + i].style.visibility = 'hidden'
	div_scale_x.children['scale_lbl' + i ].style.visibility = 'hidden'
      }
    }  
    var m = pointer.loop_start_midi
    var x = midi2posX(m.bar - 1,m.micro - 1,m.cent)
    pointer.set_loop_start_x(x)
  
    m = pointer.loop_end_midi
    x = midi2posX(m.bar - 1,m.micro - 1,m.cent)
    pointer.set_loop_end_x(x)
  
    m = pointer.scale_x_pos
    x = midi2posX(m.bar - 1,m.micro - 1,m.cent)
    pointer.pointer_x = x
    pointer.pointer.style.left = x
    pointer.pointer_triad.style.left = x - 6.5
  }
  
  
  scale_items() {
    for (var key in items.dict) {
      var it = items.dict[key]
      var x = midi2posX(it.bar - 1, it.micro - 1, it.cent)
      var w = midi2posX(it.len_bar, it.len_micro, it.len_cent)
      it.set_x(x)
      it.set_w(w) 
    }
    params.set_items()
    
  }
}

var gui = new Create_Gui(window)
