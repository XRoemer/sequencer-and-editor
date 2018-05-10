class Parameters {
  constructor() {
    this.paths = {}
    this.cnv = params_cnv
    this.ctx = this.cnv.getContext("2d")
    this.ctx.strokeStyle = 'black'
    this.ctx.translate(0.5, 0.5)
    this.add_listener()
    this.selected = []
    this.mouse_down = false
  }
  
  draw(x,h,it){
    var path = new Path2D()
    var path2 = new Path2D()
    var y = params_h - h 
    x = Math.trunc(Math.round(x * 2) / 2)
    y = Math.trunc(Math.round(y * 2) / 2)
    
    path2.rect(x,0,params_el_w,params_h)
    this.paths[it.id] = path2
    
    path.rect(x,y,params_el_w,h)
    this.ctx.fillStyle = it.col
    this.ctx.stroke(path)
    this.ctx.fill(path)
  }
  
  set_items(){
    if (show_parameters) {
      this.ctx.clearRect(0,0,win_w,params_h)
      this.ctx.fillStyle = params_bg_col
      this.ctx.fillRect(0,0, this.cnv.width, this.cnv.height)
      
      for (var id in items.dict){
        var it = items.dict[id]
        var x = it.x
        var h = params_h / 127 * it.vol
        this.draw(x,h,it)
      }
    }
  }
  
  clear(){
    this.ctx.clearRect(0,0,win_w,params_h)
    this.paths = {}
    this.ctx.fillStyle = params_bg_col
    this.ctx.fillRect(0,0, this.cnv.width, this.cnv.height)
  }
  
  
  add_listener(){
    this.cnv.addEventListener("mousemove", this.mousemove.bind(this),true)
    this.cnv.addEventListener("mousedown", this.mousedown.bind(this),true)
    this.cnv.addEventListener("mouseup", this.mouseup.bind(this),true)
  }
  
  remove_listener(){
    this.cnv.removeEventListener("mousemove", this.listener,true)
  }
  
  set_param(val,par,it){
    if (par == 'vol'){
      it.set_vol(val)
      main.show_item_pos(it)
      send_item_vol(it.id)
    }
  }
  
  search_for_mousehit(x,y){
    var sel = []
    for (var k in this.paths){
      if (this.ctx.isPointInPath(this.paths[k], x, y)) {
	sel.push(k*1)
      }
    }
    if (sel != []) {
      this.selected = sel
    }
    else this.selected = []
  }
  
  set_selected(y){
    vol = 128 - Math.trunc(128 / params_h * y)
    for (var i = 0; i < this.selected.length; i++){
      var it = items.dict[this.selected[i + '']]
      this.set_param(vol,'vol',it)
      this.set_items()
    } 
  }
  
  mousemove(e){
    var r = params_cnv.getBoundingClientRect()
    var x = e.clientX - r.left
    var y = e.clientY - r.top;

    if(this.mouse_down && ctrl_pressed){
      this.search_for_mousehit(x,y)
      this.set_selected(y)
    }
    else if (this.mouse_down && this.selected != []){
      vol = 128 - Math.trunc(128 / params_h * y)
      this.set_selected(y)
    }
    else {
      this.search_for_mousehit(x,y)
    }
  }
  
  mousedown(e){
    this.mouse_down = true
    
    if (this.selected != []){
      var r = params_cnv.getBoundingClientRect()
      var y = e.clientY - r.top;
      this.set_selected(y)
    }
  }
  
  mouseup(e){
    this.mouse_down = false
    this.selected = []
  }
}

