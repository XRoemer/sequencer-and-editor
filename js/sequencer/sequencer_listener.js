function add_listeners_to_sequencer() {

  sequencer.addEventListener("wheel", function(e) {
    if(items.selected_item != null && ctrl_pressed){
      var it = items.dict[items.selected_item]
      dx = e.deltaY / 100
      vol = Math.min(Math.max(it.vol - dx,0),127)
      it.set_vol(vol)
      show_item_pos(it)
      send_item_vol(items.selected_item)
    }
  }, false);

  sequencer.addEventListener("mousemove", function(e) {
    
    var recta = this.getBoundingClientRect()
    var mx = e.clientX - recta.left
    var my = e.clientY - recta.top
    var dy = my - items.my_old
    items.my_old = my
    var dx = mx - items.mx_old
    items.mx_old = mx
    var midi_pos = posX2midi(mx)
    var row = posY2row(my)

    show_mouse_pos(midi_pos.bar, midi_pos.micro, midi_pos.cent,row)
    
    if (!items.dragging && !items.dragging_startend 
		&& !ctrl_pressed && !shift_pressed && !alt_pressed) {
      items.search_for_close_items(mx, row)
      }
    else {
      if (items.dragging && items.selected_item != null) {
        items.drag_item(items.selected_item, my, mx, dx)
      }
      else {if (items.drag_start) {items.dragging_start(dx)}
        else if (items.drag_end) {items.dragging_end(dx)}
      }
    }
    
    
    if (ctrl_pressed && shift_pressed && e.srcElement.id == 'seq_div_extend') {
      var pos = posX2midi_quant(e.offsetX - item_w / 2)
      var bar = pos.bar
      var micro = pos.micro
      var cent = pos.cent
  
      var same = [row,bar,micro,cent].every(function(element, index) {
          return element === last_seq_dragging_pos[index];
      })
      
      if(same == false){
        var x = (bar -1) * barlen + (micro - 1) * miclen + cent/100 * miclen
        var y = (amount_rows - row - 1) * elem_h
        items.create_new_item(null, x, y)
  
      last_seq_dragging_pos = [row,bar,micro,cent]
      }
    }
    
  }, false);

  sequencer.addEventListener("mouseup", function(e) {
    seq_dragging = false
    if (e.button == 0){
      items.dragging = false
      document.getElementById('sequencer').style.cursor = "default";

      if (items.selected_item != null){
	items.dict[items.selected_item].set_inactive()
        items.selected_item = null
      }
      items.drag_end = false
      items.drag_start = false
      items.dragging_startend = false
    }
  }, false);
  
  sequencer.addEventListener("mousedown", function(e) {
    seq_dragging = true
    seq_dragstart = [e.offsetX,e.offsetY]
    if (e.button == 0){
      if (items.drag_end || items.drag_start) {
        items.dragging_startend = true
      } else if (ctrl_pressed) {
	items.create_new_item(e)
      }
    } else if (e.button == 1 && items.selected_item != null) {
      items.delete_item()
    }
  }, false);
  
  sequencer.addEventListener("dblclick", function(e) {
    items.create_new_item(e)
  }, false);
}






