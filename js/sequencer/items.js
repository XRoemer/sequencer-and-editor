class Items {
  constructor() {
    this.selected_items = []
    this.move_items_direction = null
    this.sel_items_start_posX = 0
    this.sel_items_memory = {}
    
    this.selected_item  = null
    this.dragging = false
    this.mouse_down = false
    this.mouse_row = 0
    this.my_old = 0
    this.mx_old = 0
    
    this.dict = {}
    this.snapshots = []
  }
  
  clear_vars(){
    this.selected_item  = null
    this.dragging = false
    this.dict = {}
  }

  set_items(received_array) {
    // used to set a bunch of items at once
    // at loading a preset
    var par, val

    for (var i = 0; i < received_array.length ; i++) {
      var item = new Item()
      var val = received_array[i]

      var [id, row, bar, micro] = val.slice(0,4).map( z => z * 1 )
      // do not use values outside of rows or bars
      if (row > V.amount_rows - 1 || bar > V.amount_bars ) continue
      var [cent, len_bar, len_micro, len_cent, vol] = val.slice(4).map( z => z * 1 )

      var pars = val.slice(9)
      for (var j = 0; j < pars.length / 2; j++){
	[par, val] = [pars[j*2], pars[j*2 + 1]]
	item.set_param(par, val)
      }

      var x = midi2posX(bar - 1, micro - 1, cent)
      var y = V.win_h - V.elem_h * row - V.elem_h
      var w = midi2posX(len_bar, len_micro, len_cent)
      var h = V.elem_h

      item.set_midipos({bar, micro, cent})
      item.set_midilen({len_bar, len_micro, len_cent})
      item.id = i
      item.set_row(row)
      item.set_rect(x,w,h)
      item.set_vol(vol)
      item.add_listeners()

      this.dict[i] = item

      sequencer.appendChild(item.rect);
    }

    params.set_items()
  }

  adjust_items(){
    for (var key in this.dict){
      var it = this.dict[key]
      var [bar,micro,cent,row] = [it.bar, it.micro, it.cent,it.row]
      var [len_bar,len_micro,len_cent] = [it.len_bar, it.len_micro, it.len_cent]

      var x = midi2posX(bar - 1, micro - 1, cent)
      var y = V.win_h - V.elem_h * row - V.elem_h
      var w = midi2posX(len_bar, len_micro, len_cent)
      var h = V.elem_h
      
      it.set_row(row)
      it.set_rect(x,w,h)
      sequencer.appendChild(it.rect);
    }
  }

  create_new_item(e,x,y){
    
    var bound = sequencer.getBoundingClientRect()
    if (x == null) {
      var x = Math.trunc((e.clientX - bound.left) / V.item_w) * V.item_w
      var y = Math.trunc((e.clientY - bound.top) / V.elem_h) * V.elem_h
    }

    var midi_pos = posX2midi(x)
    var midi_len = posX2midi(V.item_w)

    var item = new Item()

    var id = item.get_new_id()
    var row = posY2row(y)
    var bar = midi_pos.bar
    if (bar > V.amount_bars) return
    var micro = midi_pos.micro
    var cent = midi_pos.cent
    var len_bar = midi_len.bar - 1
    var len_micro = midi_len.micro - 1
    var len_cent = midi_len.cent

    var w = midi2posX(len_bar, len_micro, len_cent)
    var h = V.elem_h

    item.set_midipos({bar, micro, cent})
    item.set_midilen({len_bar, len_micro, len_cent})
    item.id = id
    item.set_row(row)
    item.set_vol(V.vol)
    item.set_rect(x,w,h)
    item.add_listeners()

    this.dict[id] = item
    bar += 1
    micro += 1
    data.send_new_item(id,row,bar,micro,cent,len_bar,len_micro,len_cent,V.vol)
    sequencer.appendChild(item.rect)

    params.set_items()
    return item
  }
  
  duplicate_item(it, x){

    var item = new Item()
    var midi_pos = posX2midi(x)
    if (midi_pos.bar > V.amount_bars) return null
    
    item.id = item.get_new_id()
    item.set_row(it.row)
    item.set_midipos(midi_pos)
    item.set_midilen(it)
    item.set_vol(it.vol)
    item.set_rect(x,it.w,it.h)
    item.params = Object.assign({}, it.params)
    item.add_listeners()
    
    this.dict[item.id] = item

    data.send_new_item(id,it.row,it.bar+1,it.micro+1,it.cent,it.len_bar,it.len_micro,it.len_cent,it.vol)
    sequencer.appendChild(item.rect)
    return item
  }
  
  new_item(it){
    var item = new Item()
    item.id = item.get_new_id()
    item.set_midi(it)
    item.row = it.row
    item.set_vol(it.vol)
    item.params = it.params
    item.add_listeners()
    return item
  }

  delete_item(id){
    if (id == null) id = this.selected_item
    params.remove_listener_path(id)
    this.dict[id].delete_rect()
    this.selected_item = null
    params.set_items()
    delete this.dict[id]
    data.send_del_item(id)
  }
  
  snapshot(nr){
    var nr = prompt("Enter snapshot nr (0-9)", 0);
    if (nr == null) return
    var copy = JSON.parse(JSON.stringify(items.dict))
    this.snapshots[nr] = copy
    if (this.snapshots.length > 10) this.snapshots.shift()
  }
  
  recall_snapshot(nr){
    var snsh = this.snapshots[nr]
    if (snsh == null) return
    
    var it, id, item, keys, skeys
    
    keys = Object.keys(items.dict)
    for (var i = 0; i < keys.length; i++){
      this.delete_item(keys[i])
    }
    this.dict = {}
    keys = Object.keys(snsh)
    
    for (var i = 0; i < keys.length; i++){
      id = keys[i]
      it = snsh[id]
      item = this.new_item(it)
      this.dict[id] = item
      	
      data.send_new_item(item.id,it.row,it.bar+1,it.micro+1,it.cent,
	  it.len_bar,it.len_micro,it.len_cent,it.vol)
      	    
      sequencer.appendChild(item.rect)

      skeys = Object.keys(it.params)
      if (skeys.length != 0) {
	for (var k in skeys){
	  data.send_item_param(item.id, skeys[k], it.params[skeys[k]][0])
	}
      }
    }
    this.adjust_items()
    params.set_items()
  }
  
  delete_selected(){
    for (var i = 0; i < this.selected_items.length; i++){
      this.delete_item(this.selected_items[i].id)
    }
    this.selected_items = []
  }
  
  
  select_item(id, e){
    if (id == null && items.selected_item != null) this.dict[items.selected_item].set_inactive()
    if (id != null && id != this.selected_item) this.dict[id].set_active()
    this.selected_item = id  
  }
  
  add_item_to_selected(it){
    this.selected_items.push(it)
    it.set_active()
    this.set_selected_items_memory()
  }

  select_items_on_row(){
    var row = main.mouse_pos.row - 1
    var it
    this.selected_items = []
    items.selected_item = null
    
    var keys = Object.keys(items.dict)
    for (var i = 0; i < keys.length; i++){
      it = items.dict[keys[i]]
      if (it.row == row) {
	this.selected_items.push(it)
	it.set_active()
      } else it.set_inactive()
    }
    this.set_selected_items_memory()
  }
  
  set_selected_items_memory(){
    this.sel_items_memory = {}
    var id, it
    var lowest_x = 100000
    var highest_x = 0
    var pos = main.mouse_pos
    this.sel_items_start_posX = midi2posX(pos.bar - 1, pos.micro - 1, pos.cent)

    for (var i = 0; i < this.selected_items.length; i++){
      it = this.selected_items[i]
      this.sel_items_memory[it.id] = [it.x, it.row]
      lowest_x = (lowest_x > it.x) ? it.x : lowest_x
      highest_x = (highest_x < it.x) ? it.x : highest_x
    }
    this.sel_items_memory['lowest_x'] = lowest_x
    this.sel_items_memory['highest_x'] = highest_x
  }

  deselect_items(){
    var it
    this.move_items_V = false
    this.move_items_h = false
    for (var i = 0; i < this.selected_items.length; i++){
      it = this.selected_items[i]
      it.set_inactive()
    }
    this.selected_items = []
    items.move_items_direction = null
    params.set_items()
  }
  abort_move_items(){
    this.reset_items_on_yAxis()
    this.set_items_on_xAxis(0)
    this.deselect_items()
  }
  
  set_selected_items(){
    if(this.move_items_direction == null) return
    if(this.move_items_direction == 'y'){
      this.move_items_on_yAxis()
    } else if(this.move_items_direction == 'x'){
      this.move_items_on_xAxis(main.mouse_pos)
    }
  }
  
  repeat_selected(){
    var keys = Object.keys(this.sel_items_memory)
    var lowest_x = this.sel_items_memory['lowest_x']
    var index = keys.indexOf('lowest_x')
    keys.splice(index, 1)
    index = keys.indexOf('highest_x')
    keys.splice(index, 1)
    
    var highest_x = 0
    var it, x, y, item, new_items = []
    
    for (var i = 0; i < keys.length; i++){
      it = items.dict[keys[i]]
      highest_x = Math.max(highest_x, it.x + it.w)
    }
    
    this.selected_items = []
    for (var i = 0; i < keys.length; i++){
      it = items.dict[keys[i]]
      x = highest_x + it.x - lowest_x
      y = it.y
      item = this.duplicate_item(it,x)
      it.set_inactive()
      if (item != null){
        item.set_active()
        this.selected_items.push(item)
      }
    }
    this.set_selected_items_memory()
  }
  
  move_items_on_yAxis(){
    var it, id, row, dx_row, orig_row,new_row
    row = main.mouse_pos.row - 1
    dx_row = row - this.mouse_row
    for (var i = 0; i < this.selected_items.length; i++){
      it = this.selected_items[i]
      id = it.id
      orig_row = this.sel_items_memory[id][1]
      new_row = Math.max(orig_row + dx_row,0)
      it.set_row(new_row)
      data.send_item_row(id,new_row)
    }
  }
  
  reset_items_on_yAxis(){
    var it, id, row
    for (var i = 0; i < this.selected_items.length; i++){
      it = this.selected_items[i]
      id = it.id
      row = this.sel_items_memory[id][1]
      it.set_row(row)
      data.send_item_row(id,row)
    }
  }

  move_items_on_xAxis(pos){
    var x = midi2posX(pos.bar - 1, pos.micro - 1, pos.cent)
    var dx = x - this.sel_items_start_posX
    var low = this.sel_items_memory.lowest_x
    var high = this.sel_items_memory.highest_x
    var maxw = V.win_w
    dx = (low + dx) < 0 ? -low : dx
    dx = (high + dx) > maxw ? maxw - high - 1 : dx
    this.set_items_on_xAxis(dx)
  }
  
  set_items_on_xAxis(dx){
    var x, it, id, old_pos
    for (var i = 0; i < this.selected_items.length; i++){
      it = this.selected_items[i]
      id = it.id
      old_pos = this.sel_items_memory[id][0]
      x = old_pos + dx
      this.adjust_item_x(id,x)
    }
  }

  drag_item(id,my,mx,dx) {
    sequencer.style.cursor = "move";
    var it = this.dict[id]
    var mx = Math.min(mx, V.win_w - 1 )
    this.drag_itemX(it,id,mx,dx)
    this.drag_itemY(it,id,my)
    main.show_item_pos(it)
  }

  drag_itemX(it,id,mx,dx){
    var item_x = it.x

    var x = Math.max(item_x + dx, 0)
    if (!V.use_quant) {
      this.adjust_item_x(id,x)
    } else {
      var it_pos = Math.round(item_x / V.item_w)
      var cur_pos = Math.round(mx / V.item_w)
      if (cur_pos != it_pos) {
        var x = cur_pos * V.item_w
        this.adjust_item_x(id,x)
      }
    }
    params.set_items()
  }

  drag_itemY(it,id,my){
    var old_row = it.row
    var row = Math.max(V.amount_rows - Math.trunc(my / V.elem_h) - 1, 0)
    if (old_row != row) {
      it.set_row(row)
      data.send_item_row(id,row)
    }
  }

  // dragging start or end doesn't use quantisation
  // should it be changed?
  
  dragging_start(dx) {
    var use_quant = V.use_quant
    V.use_quant = false
    var id = this.selected_item
    var it = this.dict[id]
    var w = Math.max( it.w - dx, 1)
    var dx = (w == 1) ? 0 : dx
    var x = Math.max(it.x + dx, 1)
    this.adjust_item_x(id,x)
    this.adjust_item_w(id,w)
    V.use_quant = use_quant
  }
  
  dragging_end(dx) {
    var use_quant = V.use_quant
    V.use_quant = false
    var id = this.selected_item
    var it = this.dict[id]
    var w = Math.max( it.w + dx, 1)
    this.adjust_item_w(id,w)
    V.use_quant = use_quant
  }
  
  adjust_item_x(id,x){
    var it = items.dict[id]
    it.set_x(x)
    var midipos = posX2midi(x)
    data.send_item_x(id,midipos)
    it.bar = midipos.bar
    it.micro = midipos.micro
    it.cent = midipos.cent
  }
  
  adjust_item_w(id,w){
    var it = items.dict[id]
    var midilen = posX2midi(w)
    it.set_w(w)
    it.len_bar = midilen.bar - 1
    it.len_micro = midilen.micro - 1
    it.len_cent = midilen.cent
    data.send_item_w(id,midilen)
  }
}
