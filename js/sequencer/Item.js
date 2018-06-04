

class Item {

  constructor() {
    this.id = null
    this.row = null
    
    this.bar = null
    this.micro = null
    this.cent = null
    this.len_bar = null
    this.len_micro = null
    this.len_cent = null
    
    this.vol = null
    this.x = null
    this.y = null
    this.w = null
    this.h = null
    this.col = null
    this.curpos = null

    this.params = {}
    this.rect = this.create_rect()
  }

  create_rect() {
    var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.style.stroke = "black"
    rect.style.strokeWidth = "2px"
    svg.style.position="absolute"
    svg.appendChild(rect);
    return svg
  }
  sortNumber(a,b) {
    return Number(a) - (b);
  }
  get_new_id(){
    if (items.dict[0]) {
      var ids = Object.keys(items.dict)
      var nr = ids.sort(this.sortNumber).slice(-1)[0]
      var new_id = nr * 1 + 1
    }
    else new_id = 0
    return new_id
  }
  set_x(x){
    this.x = x
    this.rect.style.left = x
  }
  set_y(y){
    this.y = y
    this.rect.style.top = y
  }
  set_w(w){
    this.w = w
    this.rect.style.width = w
    this.rect.firstChild.style.width = w
  }
  set_h(h){
    this.h = h
    this.rect.style.height = h
    this.rect.firstChild.style.height = h
  }
  set_rect(x,w,h){
    this.set_w(w)
    this.set_h(h)
    this.set_x(x)
  }
  set_row(row){
    this.row = row
    this.set_y(row2posY(row))
  }
  set_midilen(it){
    this.len_bar = it.len_bar
    this.len_micro = it.len_micro
    this.len_cent = it.len_cent
  }
  set_midipos(it){
    this.bar = it.bar 
    this.micro = it.micro 
    this.cent = it.cent
  }
  set_midi(it){
    this.set_midilen(it)
    this.set_midipos(it)
  }

  delete_rect() {
    this.rect.parentNode.removeChild(this.rect)
  }

  set_vol(vol){
    this.vol = vol
    this.col = calc_color(vol)
    this.rect.firstChild.style.fill = this.col
  }
  set_param(par,val){
    if (val == 'del') delete this.params[par]
    else {
      var col = calc_color(val, params.param)
      this.params[par] = [val,col]
    }
  }
  
  set_active(){this.rect.style.stroke = 'red'}
  set_inactive(){this.rect.style.stroke = 'black'}


  add_listeners() {
    this.rect.addEventListener("mousemove", e => {
      if (items.selected_items.length != 0) return
      
      if (!items.dragging) {
        items.select_item(this.id,e)
        main.show_item_pos(this)
        this.get_curpos_on_item(e)
      } 
      if(e.altKey && e.shiftKey){
        items.delete_item()
      }
     }, false)
        
    this.rect.addEventListener("mouseout", e => {
          if (!items.dragging) {
            items.select_item(null)
            sequencer.style.cursor = "default"
          }
        }, false)
        
    this.rect.addEventListener("mousedown", e => {
      if (items.selected_items.length != 0 && e.shiftKey) {
	items.add_item_to_selected(this)
      }
      else if (e.button == 0){
          items.dragging = true
        }
        }, false)
  }
  
  get_curpos_on_item(e){
    var select_w = items.dict[this.id].w / 5
    
    if (e.offsetX >=  items.dict[this.id].w - select_w){
	sequencer.style.cursor = "w-resize"
	this.curpos = 2
    } else if (e.offsetX <= select_w){
	sequencer.style.cursor = "col-resize"
	  this.curpos = 0
    }
    else {
	sequencer.style.cursor = "default"
	  this.curpos = 1
    }
  }
 
}
