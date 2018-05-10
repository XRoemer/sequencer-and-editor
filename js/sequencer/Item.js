

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
  set(values){
    for (var k in values){
      this[k] = values[k]
    }
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
  set_midipos(){}
  set_midilen(){}
  
  delete() {
    var del = 1
    var id = this.id
    items.adjust_arrays({id, del})
    items.selected_item = null
    items.selected_item_se = null
    this.rect.parentNode.removeChild(this.rect)
  }
  
  drag_x(){}
  drag_y(){}
  drag_start(){}
  drag_end(){}
  
  set_vol(vol){
    this.vol = vol
    this.col = calc_color(vol)
    this.rect.firstChild.style.fill = this.col
  }
  set_active(){this.rect.style.stroke = 'red'}
  set_inactive(){this.rect.style.stroke = 'black'}
  set_param(){}
  
  add_listeners() {
    this.rect.addEventListener("mouseover", e => {
        if (!items.dragging && !items.dragging_startend) {
          this.rect.style.stroke = 'red'
          items.selected_item = this.id
          main.show_item_pos(this)
        }
        if(alt_pressed && shift_pressed){
          items.delete_item()
        }
        }, false);
    this.rect.addEventListener("mouseout", e => {
          if (!items.dragging && !items.dragging_startend) {
            items.selected_item = null
            this.rect.style.stroke = 'black'
          }
        }, false);
    this.rect.addEventListener("mousedown", e => {
          if (e.button == 0){
              items.dragging = true
            }
        }, false);
  }
  
  
}