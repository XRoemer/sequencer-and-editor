class Items {
  constructor() {
    this.selected_item  = null
    this.selected_item_se  = null
    this.dragging = false
    this.drag_start = false
    this.drag_end = false
    this.dragging_startend = false
    this.my_old = 0
    this.mx_old = 0
    this.dict = {}
    this.items_by_row  = {}
  }
  
  set_items(received_array) {

    clear_sequencer()
    
    for (var i = 0; i < received_array.length ; i++) {
      var item = new Item()
      var val = received_array[i]

      var [id, row, bar, micro] = val.slice(0,4).map( z => z * 1 )
      // do not use values outside of rows or bars
      if (row > amount_rows - 1 || bar > amount_bars - 1) continue
      var [cent, len_bar, len_micro, len_cent, vol] = val.slice(4).map( z => z * 1 )

      var x = midi2posX(bar - 1, micro - 1, cent)
      var y = win_h - elem_h * row - elem_h
      var w = midi2posX(len_bar, len_micro, len_cent)
      var h = elem_h
        
      item.set({bar, micro, cent})
      item.set({len_bar, len_micro, len_cent})
      item.id = i
      item.row = row
      item.set_w(w)
      item.set_h(h)
      item.set_vol(vol)
      item.set_x(x)
      item.set_y(y)
      item.add_listeners(item)


      this.dict[i] = item
      this.insert_items_by_row(item)

      document.getElementById('sequencer').appendChild(item.rect);
    }
    params.set_items()
  }
  
  create_new_item(e,x,y){

    var div = document.getElementById("sequencer");
    var bound = div.getBoundingClientRect()
    if (x == null) {
      var x = Math.trunc((e.clientX - bound.left) / item_w) * item_w
      var y = Math.trunc((e.clientY - bound.top) / elem_h) * elem_h
    }

    var midi_pos = posX2midi(x)
    var midi_len = posX2midi(item_w)

    var item = new Item()

    var id = item.get_new_id()
    var row = posY2row(y)
    var bar = midi_pos.bar
    var micro = midi_pos.micro
    var cent = midi_pos.cent
    var len_bar = midi_len.bar - 1
    var len_micro = midi_len.micro - 1
    var len_cent = midi_len.cent

    var w = midi2posX(len_bar, len_micro, len_cent)
    var h = elem_h

    item.set({bar, micro, cent})
    item.set({len_bar, len_micro, len_cent})
    item.id = id
    item.row = row
    item.set_w(w)
    item.set_h(h)
    item.set_vol(vol)
    item.set_x(x)
    item.set_y(y)
    item.add_listeners(item)
    
    this.dict[id] = item
    this.insert_items_by_row(item)
    bar += 1
    micro += 1
    send_new_item(id,row,bar,micro,cent,len_bar,len_micro,len_cent,vol)
    document.getElementById('sequencer').appendChild(item.rect)
    
    params.set_items()
  }
  
  delete_item(){
    this.dict[this.selected_item].delete()
  }
  
  insert_items_by_row(it) {
    var row = it.row
    if (!this.items_by_row[row]) {
      this.items_by_row[row] = [it]
    }
    else {
      var arr_row = this.items_by_row[row]
      for (var i = 0; i < arr_row.length ; i++) {
	if (it.x < arr_row[i].x) break
	}
      arr_row.splice(i , 0, it);
    }
  }

  search_for_close_items(mx, row) {
    if (!this.items_by_row[row]) return

    var left = null
    var right = null
    var right_found = false

    for (var i = 0; i < this.items_by_row[row].length ; i++) {
      var it = this.items_by_row[row][i]
      if (it.x > mx && !right_found) {
      	right = [it.x - mx, it.id]
      	right_found = true
      	}
      if (it.x + it.w < mx) {
      	left = [mx - it.x - it.w, it.id]
      	}
    }
    if (right && right[0] < 10) {
      document.getElementById('sequencer').style.cursor = "w-resize";
      if (this.selected_item_se != null) {
        if (this.selected_item_se != right[1]) {
  	this.dict[this.selected_item_se].set_inactive()
          this.selected_item_se = right[1]
          this.dict[items.selected_item_se].set_active()
        }
      }
      else {
        this.selected_item_se = right[1]
        this.dict[this.selected_item_se].set_active()
      }
      this.drag_end = false
      this.drag_start = true
    }
    else if (left && left[0] < 10) {
      document.getElementById('sequencer').style.cursor = "col-resize"
      if (this.selected_item_se != null) {
        if (this.selected_item_se != left[1]) {
  	this.dict[this.selected_item_se].set_inactive()
          this.selected_item = left[1]
      	this.dict[this.selected_item_se].set_active()
        }
      }
      else {
        this.selected_item_se = left[1]
        this.dict[this.selected_item_se].set_active()
      }
      this.drag_end = true
      this.drag_start = false
    }
    else {
      document.getElementById('sequencer').style.cursor = "default"
      this.drag_end = false
      this.drag_start = false
      if (this.selected_item_se != null) {
        this.dict[this.selected_item_se].set_inactive()
        this.selected_item_se = null
      }
    }
  }

  drag_item(id,my,mx,dx) {
    document.getElementById('sequencer').style.cursor = "move";
    var it = this.dict[id]
    var mx = Math.min(mx, win_w - 1 )
    this.drag_itemX(it,id,mx,dx)
    this.drag_itemY(it,id,my)
    main.show_item_pos(it)
  }

  drag_itemX(it,id,mx,dx){
    var item_x = it.x
    var x = Math.max(item_x + dx, 0)
    if (!use_quant) {
      
      this.adjust_arrays({id,x})
      it.set_x(x)
    } else {
      var it_pos = Math.round(item_x / item_w)
      var cur_pos = Math.round(mx / item_w)
      if (cur_pos != it_pos) {
        var x = cur_pos * item_w
        this.adjust_arrays({id,x})
        it.set_x(x)
      }
    }
    params.set_items()
  }

  drag_itemY(it,id,my){
    var it_row = it.row
    var cur_row = Math.max(cur_row = amount_rows - Math.trunc(my / elem_h) - 1, 0)
    if (it_row != cur_row) {
      var row = cur_row
      this.adjust_arrays({id,row})
      var y = win_h - it.row * elem_h - elem_h
      it.set_y(y)
    }
  }

  dragging_start(dx) {
    var it = this.dict[this.selected_item_se]
    var w = Math.max( it.w - dx, 1)
    var dx = (w == 1) ? 0 : dx
    var x = Math.max(it.x + dx, 1)
    it.w = w
    var id = this.selected_item_se
    this.adjust_arrays({id,x,w})
    it.set_x(x)
    it.set_w(w)
  }
  dragging_end(dx) {
    var it = this.dict[this.selected_item_se]
    var w = Math.max( it.w + dx, 1)
    var x = parseFloat(it.x)
    it.w = w
    var id = this.selected_item_se
    this.adjust_arrays({id,x,w})
    it.set_w(w)
  }

  adjust_arrays(args) {
    var id = args.id
    var it = this.dict[id]

    if (args.row != null) {
      var x = args.x
      var w = it.w + x
      var old_row = it.row
      var new_row = args.row
      it.row = new_row
      this.adjust_arr_items_by_row({id,x,w,old_row,new_row})
      send_item_row(id,new_row)
    }
    if (args.x != null) {
      var x = args.x
      var w = it.w
      
      this.adjust_arr_items_by_row({id,x,w})
      // wird in adjust gesetzt it.x = x
      var midipos = posX2midi(x)
      send_item_x(id,midipos)
      it.bar = midipos.bar
      it.micro = midipos.micro
      it.cent = midipos.cent
    }
    if (args.w) {
      var x = args.x
      var w = it.w
      this.adjust_arr_items_by_row({id,w})
      // wird in adjust gesetzt it.x = x
      var midilen = posX2midi(w)
      send_item_w(id,midilen)
      it.len_bar = midilen.bar - 1
      it.len_micro = midilen.micro - 1
      it.len_cent = midilen.cent
      main.show_item_pos(it)
    }
    if (args.vol != null) {
      it.set_vol(args.vol)
      send_item_vol(id,midipos)
      params.set_items()
    }
    main.show_item_pos(it)
    if (args.del){
      var x = args.x
      var row = it.row
      var w = it.w
      var del = 1
      this.adjust_arr_items_by_row({id,row,del})
      delete this.dict[id]
      send_del_item(id)
    }
  }

  adjust_arr_items_by_row(args){

    if (args.del){
      var ind = this.get_index_of_arr_el(args.row, args.id)
      this.items_by_row[args.row].splice(ind,1)
    }
    if (args.new_row != null){
      var ind = this.get_index_of_arr_el(args.old_row, args.id)
      this.items_by_row[args.old_row].splice(ind,1)
      var it = this.dict[args.id]
      this.insert_items_by_row(it)
    }
    if (args.x != null || args.w){
      var it = this.dict[args.id]
      var ind = this.get_index_of_arr_el(it.row, args.id)
      this.items_by_row[it.row].splice(ind,1)
      it.x = args.x ? args.x : it.x
      it.w = args.w ? args.w : it.w
      this.insert_items_by_row(it)
    }
  }

  get_index_of_arr_el(row,id) {
    if(!this.items_by_row[row]){
      throw "error"
    }
    for (var i = 0; i < this.items_by_row[row].length ; i++) {
      if (this.items_by_row[row][i].id == id) {
        return i
      }
    }
    throw "error"
  }
}

var barlen = 0
var miclen = 0





