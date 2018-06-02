last_seq_dragging_pos = [0,0,0,0]


function add_listeners_to_sequencer() {

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

    main.show_mouse_pos(midi_pos.bar, midi_pos.micro, midi_pos.cent,row)
    
    
    if (items.mouse_down && !items.dragging){
      create_selection_rect(mx,my)
      select_rect(mx,my,e)
    } 
    items.set_selected_items()
    
    if (items.dragging && items.selected_item != null) {
	var id = items.selected_item
	var it = items.dict[id]
	var curpos = it.curpos
	if (curpos == 1) items.drag_item(id, my, mx, dx)
	else if (curpos == 0) items.dragging_start(dx)
	else if (curpos == 2) items.dragging_end(dx)
	params.set_items()
	main.show_item_pos(it)
    }
    
    if (e.ctrlKey && e.shiftKey && e.srcElement.id == 'sequencer') {
      var pos = posX2midi_quant(e.offsetX)
      var bar = pos.bar
      var micro = pos.micro
      var cent = pos.cent
      var same = [row,bar,micro,cent].every(function(element, index) {
          return element === last_seq_dragging_pos[index];
      })
      if(same == false){
        var x = (bar -1) * V.barlen + (micro - 1) * V.miclen + cent/100 * V.miclen
        var y = (V.amount_rows - row - 1) * V.elem_h
        items.create_new_item(null, x, y)

      last_seq_dragging_pos = [row,bar,micro,cent]
      }
    }

  }, false);

  sequencer.addEventListener("mouseup", function(e) {
    if (e.button == 0){
      items.dragging = false
      items.mouse_down = false
      remove_selection_rect()
      document.getElementById('sequencer').style.cursor = "default";
    }
  }, false);

  sequencer.addEventListener("mousedown", function(e) {
    if (e.button == 0){
      if (e.ctrlKey) {
	items.create_new_item(e)
      } else items.mouse_down = true
    } else if (e.button == 1 && items.selected_item != null) {
      items.delete_item()
    } 
  }, false);

  sequencer.addEventListener("dblclick", function(e) {
    items.create_new_item(e)
  }, false);
}

var selection_start = []
function create_selection_rect(x,y){
  var sel_rect = document.getElementById('sel_rect')
  if (sel_rect == null){
    selection_start = [x,y]
    var sel_rect = document.createElement("canvas");
    sel_rect.id = 'sel_rect'
    sel_rect.style.position = 'absolute'
    sel_rect.style.left = x
    sel_rect.style.top = y
    sequencer.appendChild(sel_rect)
  }  
}

function select_rect(x,y,e){
  var dx = Math.max(x - selection_start[0],0)
  var dy = Math.max(y - selection_start[1],0)

  sel_rect.width = dx
  sel_rect.height = dy
  sel_rect.style.width = dx
  sel_rect.style.height = dy
  
  var ctx = sel_rect.getContext("2d")
  ctx.clearRect(0, 0, sel_rect.width, sel_rect.height);
  ctx.fillStyle = 'red'
  ctx.globalAlpha=0.2;
  ctx.opacity = 0.5
  ctx.rect(0,0,dx,dy)
  ctx.fillRect(0,0,dx,dy)
  if (!e.shiftKey) {
    items.selected_items = []
    items.sel_items_memory = {}
  }
  
  
  var keys = Object.keys(items.dict)
  for (var i = 0; i < keys.length; i++){
    it = items.dict[keys[i]]
    var it_x = it.x - selection_start[0]
    var it_y = it.y - selection_start[1]
    if (items.sel_items_memory[it.id] == null){
      if (ctx.isPointInPath(it_x,it_y)) {
	it.set_active()
	items.selected_items.push(it)
      } else it.set_inactive()
    } 
    
  }
  items.set_selected_items_memory()
  
}

function remove_selection_rect(){
  var sel_rect = document.getElementById('sel_rect')
  if (sel_rect != null){
    sequencer.removeChild(sel_rect)
    selection_start = []
  }
}







