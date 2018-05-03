var selected_item  = null
var selected_item_se  = null
var dragging = false
var drag_start = false
var drag_end = false
var dragging_startend = false
var drag_y_tmp = 0
var items = {}
var items_by_row = {}
var barlen = 0
var miclen = 0
var my_old = 0
var mx_old = 0


function Rect() {
  rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.style.stroke = "black"
  rect.style.strokeWidth = "2px"
  svg.style.position="absolute"
  rect.style.width="10px"
  rect.style.height="10px"
  svg.style.width="10px"
  svg.style.height="10px"
  svg.appendChild(rect);
  return svg
}


function set_items(received_array) {

  clear_sequencer()
  var rect0 = new Rect()

  for (var i = 0; i < received_array.length ; i++) {
    var rect1 = rect0.cloneNode(true)
    var val = received_array[i]

    var id = Number(val[0])
    var row = Number(val[1])
    var bar = Number(val[2]) - 1
    if (row > amount_rows - 1 || bar > amount_bars - 1) continue
    var micro = Number(val[3]) - 1
    var cent = Number(val[4])
    var len_bar = Number(val[5])
    var len_micro = Number(val[6])
    var len_cent = Number(val[7])
    var vol = Number(val[8])

    var x = midi2posX(bar, micro, cent)
    var y = win_h - elem_h * row - elem_h
    var w = midi2posX(len_bar, len_micro, len_cent)
    var h = elem_h

    bar += 1
    micro += 1

    rect1.info = {id,row,bar,micro,cent,len_bar,len_micro,len_cent,vol,x,w}
    rect1.id = i
    rect1.row = row
    rect1.style.width = w
    rect1.style.height = h
    rect1.firstChild.style.width = w
    rect1.firstChild.style.height = h

    rect1.firstChild.style.fill = calc_color(vol)
    rect1.style.left = x
    rect1.style.top = y
    add_listeners(rect1)


    items[i] = rect1
    insert_items_by_row(rect1)

    document.getElementById('sequencer').appendChild(rect1);
  }
}

function create_new_item(e,x,y){

  var div = document.getElementById("sequencer");
  var bound = div.getBoundingClientRect()
  if (x == null) {
    var x = Math.trunc((e.clientX - bound.left) / item_w) * item_w
    var y = Math.trunc((e.clientY - bound.top) / elem_h) * elem_h
  }

  var midi_pos = posX2midi(x)
  var midi_len = posX2midi(item_w)

  var rect = new Rect()

  var id = get_new_id()
  var row = posY2row(y)
  var bar = midi_pos.bar
  var micro = midi_pos.micro
  var cent = midi_pos.cent
  var len_bar = midi_len.bar - 1
  var len_micro = midi_len.micro - 1
  var len_cent = midi_len.cent

  var w = midi2posX(len_bar, len_micro, len_cent)
  var h = elem_h

  rect.info = {id,row,bar,micro,cent,len_bar,len_micro,len_cent,vol,x,w}
  rect.id = id
  rect.row = row
  rect.style.width = w
  rect.style.height = h
  rect.firstChild.style.width = w
  rect.firstChild.style.height = h

  rect.firstChild.style.fill = calc_color(vol)
  rect.style.left = x
  rect.style.top = y
  add_listeners(rect)

  items[id] = rect
  insert_items_by_row(rect)
  bar += 1
  micro += 1
  new_item(id,row,bar,micro,cent,len_bar,len_micro,len_cent,vol)
  document.getElementById('sequencer').appendChild(rect);
}

function delete_item(){
  var it = items[selected_item]
  var del = 1
  var id = selected_item
  adjust_arrays({id,del})
  selected_item = null
  selected_item_se = null
  it.parentNode.removeChild(it)
}


function get_new_id(){
  if (items[0]) {
    var ids = Object.keys(items)
    var nr = ids.sort(sortNumber).slice(-1)[0]
    var new_id = Number(nr) + 1
  }
  else new_id = 0
  return new_id
}

function insert_items_by_row(it) {
  var row = it.info.row
  if (!items_by_row[row]) {
    items_by_row[row] = [[it.info.x, it.info.x + it.info.w, it.id]]
  }
  else {
    insert_item_in_row(items_by_row[row],it)
  }
}

function insert_item_in_row(arr_row,it) {
  for (var i = 0; i < arr_row.length ; i++) {
    if (it.x > arr_row[i][0]) break
  }
  arr_row.splice(i, 0, [it.info.x, it.info.x + it.info.w, it.id]);
}

function add_listeners(el) {
  el.addEventListener("mouseover", function(e) {
      if (!dragging && !dragging_startend) {
        rect = get_div(e)
        rect.style.stroke = 'red'
        selected_item = rect.id
        show_item_pos(rect)
      }
      if(alt_pressed && shift_pressed){
	delete_item()
      }
      }, false);
  el.addEventListener("mouseout", function(e) {
        if (!dragging && !dragging_startend) {
          rect = get_div(e)
          selected_item = null
          rect.style.stroke = 'black'
        }
      }, false);
  el.addEventListener("mousedown", function(e) {
        if (e.button == 0){
            dragging = true
          }
      }, false);
}

function add_listeners_to_cnv(el) {

  el.addEventListener("wheel", function(e) {
    if(selected_item){
      var it = items[selected_item]
      dx = e.deltaY / 100
      vol = Math.min(Math.max(it.info.vol - dx,0),127)
      it.info.vol = vol
      it.firstChild.style.fill = calc_color(vol)
      show_item_pos(it)
      set_item_vol(selected_item)
    }
  }, false);

  el.addEventListener("mousemove", function(e) {

    var recta = this.getBoundingClientRect()
    var mx = e.clientX - recta.left
    var my = e.clientY - recta.top
    dy = my - my_old
    my_old = my
    dx = mx - mx_old
    mx_old = mx
    var midi_pos = posX2midi(mx)
    var row = posY2row(my)

    show_mouse_pos(midi_pos.bar, midi_pos.micro, midi_pos.cent,row)

    if (!dragging && !dragging_startend) {search_for_close_items(mx, row)}
    else {
      if (dragging && selected_item) {
        drag_item(selected_item, my, mx, dx)
      }
      else {if (drag_start) {dragging_start(dx)}
        else if (drag_end) {dragging_end(dx)
        }
      }
    }
  }, false);

  el.addEventListener("mouseup", function(e) {
    if (e.button == 0){
      dragging = false
      document.getElementById('sequencer').style.cursor = "default";

      if (selected_item){
        el = items[selected_item]
        el.style.stroke = 'black'
        selected_item = null
        drag_y_tmp = 0
      }
      drag_end = false
      drag_start = false
      dragging_startend = false
    }
  }, false);
  el.addEventListener("mousedown", function(e) {
    if (e.button == 0){
      if (drag_end || drag_start) {
        dragging_startend = true
      } else if (ctrl_pressed) {
          create_new_item(e)
      }
    } else if (e.button == 1 && selected_item) {
      delete_item()
    }
  }, false);
  el.addEventListener("dblclick", function(e) {
    create_new_item(e)
  }, false);
}

function get_div(ev) {
  if (ev.path[0].nodeName == 'svg') return ev.path[0]
  else return ev.path[1]
}


function active(){items[selected_item_se].style.stroke = 'red'}
function inactive(){items[selected_item_se].style.stroke = 'black'}

function search_for_close_items(mx, row) {
  //log({mx,row,items_by_row})
  if (!items_by_row[row]) return

  var pre = null
  var post = null
  var post_found = false

  for (var i = 0; i < items_by_row[row].length ; i++) {
    var it_pos = items_by_row[row][i]
    if (it_pos[0] > mx && !post_found) {
    	post = [it_pos[0] - mx, it_pos[2]]
    	post_found = true
    	}
    if (it_pos[1] < mx) {
    	pre = [mx - it_pos[1], it_pos[2]]
    	}
  }
  if (post && post[0] < 10) {
    document.getElementById('sequencer').style.cursor = "w-resize";
    if (selected_item_se) {
      if (selected_item_se != post[1]) {
        inactive()
        selected_item_se = post[1]
        active()
      }
    }
    else {
      selected_item_se = post[1]
      active()
    }
    drag_end = false
    drag_start = true
  }
  else if (pre && pre[0] < 10) {
    document.getElementById('sequencer').style.cursor = "col-resize"
    if (selected_item_se) {
      if (selected_item_se != pre[1]) {
    	inactive()
        selected_item = pre[1]
    	active()
      }
    }
    else {
      selected_item_se = pre[1]
      active()
    }
    drag_end = true
    drag_start = false
  }
  else {
    document.getElementById('sequencer').style.cursor = "default"
    drag_end = false
    drag_start = false
    if (selected_item_se) {
    	inactive()
    	selected_item_se = null
    }
  }
}

function drag_item(id,my,mx) {
  document.getElementById('sequencer').style.cursor = "move";
  var it = items[id]
  var mx = Math.min(mx, win_w - 1 )
  drag_itemX(it,id,mx,dx)
  drag_itemY(it,id,my)
  show_item_pos(it)
}

function drag_itemX(it,id,mx,dx){
  var item_x = parseInt(it.style.left)
  var x = item_x + dx
  if (!use_quant) {
    adjust_arrays({id,x})
    it.style.left = x
  } else {
    var it_pos = Math.round(item_x / item_w)
    var cur_pos = Math.round(mx / item_w)

    if (cur_pos != it_pos) {
      var x = cur_pos * item_w
      adjust_arrays({id,x})
      it.style.left = x
      drag_x_tmp = 0
    }
  }
}

function drag_itemY(it,id,my){
  var it_row = it.info.row
  var cur_row = Math.max(cur_row = amount_rows - Math.trunc(my / elem_h) - 1, 0)
  if (it_row != cur_row) {
    var row = cur_row
    adjust_arrays({id,row})
    var top = win_h - parseInt(it.info.row) * elem_h - elem_h
    var info_row = parseInt(it.info.row)
    it.style.top = top
  }
}

function dragging_start(dx) {
  var it = items[selected_item_se]
  var w = Math.max( it.info.w - dx, 1)
  dx = (w == 1) ? 0 : dx
  var x = Math.max(parseFloat(it.style.left) + dx, 1)
  it.info.w = w
  var id = selected_item_se
  adjust_arrays({id,x,w})
  it.style.left = x
  it.style.width = w
  it.firstChild.style.width = w
}
function dragging_end(dx) {
  var it = items[selected_item_se]
  var w = Math.max( it.info.w + dx, 1)
  var x = parseFloat(it.style.left)
  it.info.w = w
  var id = selected_item_se
  adjust_arrays({id,x,w})
  it.style.width = w
  it.firstChild.style.width = w
}

function adjust_arrays(args) {
  var id = args.id
  var it = items[id]

  if (args.row != null) {
    var x = args.x
    var w = it.info.w + x
    var old_row = it.info.row
    var new_row = args.row
    it.info.row = new_row
    adjust_arr_items_by_row({id,x,w,old_row,new_row})
    set_item_row(id,new_row)
  }
  if (args.x) {
    var x = args.x
    var w = it.info.w
    adjust_arr_items_by_row({id,x,w})
    // wird in adjust gesetzt it.info.x = x

    var midipos = posX2midi(x)
    set_item_x(id,midipos)
    it.info.bar = midipos.bar
    it.info.micro = midipos.micro
    it.info.cent = midipos.cent
  }
  if (args.w) {
    var x = args.x
    var w = it.info.w
    adjust_arr_items_by_row({id,w})
    // wird in adjust gesetzt it.info.x = x
    var midilen = posX2midi(w)
    set_item_w(id,midilen)
    it.info.len_bar = midilen.bar - 1
    it.info.len_micro = midilen.micro - 1
    it.info.len_cent = midilen.cent
    show_item_pos(it)
  }
  if (args.vol) {
    it.info.vol = args.vol
    set_item_vol(id,midipos)
  }
  show_item_pos(it)
  if (args.del){
    var x = args.x
    var row = it.info.row
    var w = it.info.w
    var del = 1
    adjust_arr_items_by_row({id,row,del})
    delete items[id]
    del_item(id)
  }
}

function adjust_arr_items_by_row(args){
  if (args.del){
    var ind = get_index_of_arr_el(args.row, args.id)
    items_by_row[args.row].splice(ind,1)
  }
  if (args.new_row != null){
    var ind = get_index_of_arr_el(args.old_row, args.id)
    items_by_row[args.old_row].splice(ind,1)
    var it = items[args.id]
    insert_items_by_row(it)
  }
  if (args.x || args.w){
    var it = items[args.id]
    var ind = get_index_of_arr_el(it.info.row, args.id)
    items_by_row[it.info.row].splice(ind,1)
    it.info.x = args.x ? args.x : it.info.x
    it.info.w = args.w ? args.w : it.info.w
    insert_items_by_row(it)
  }
}

function get_index_of_arr_el(row,id) {
  if(!items_by_row[row]){
    throw "error"
  }
  for (var i = 0; i < items_by_row[row].length ; i++) {
    if (items_by_row[row][i][2] == id) {
      return i
    }
  }
  throw "error"
}

function set_item_x(id,midipos){
  send_data(['memory change',id,'pos',midipos.bar,midipos.micro,midipos.cent].join(' '), window.win_nr)
}
function set_item_w(id,midilen){
  var bar = midilen.bar - 1
  var micro = midilen.micro - 1
  send_data(['memory change',id,'len',bar,micro,midilen.cent].join(' '), window.win_nr)
}
function set_item_row(id,row){
  send_data('memory change '+id+' row '+row, window.win_nr)
}
function new_item(id,row,bar,micro,cent,len_bar,len_micro,len_cent,vol){
  var str = ['memory new',id,row,bar-1,micro-1,cent,len_bar,len_micro,len_cent,vol].join(' ')
  send_data(str, window.win_nr)
}
function del_item(id){
  send_data('memory del '+id, window.win_nr)
}
function set_item_vol(id){
  send_data('memory change '+id+' vol ' + vol, window.win_nr)
}

