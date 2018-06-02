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
    
    this.param = 'vol'
    this.params = {}
    this.init_par()
  }
  
  init_par(){
    var y = Math.trunc(V.params_h / 2) - 20
    var sel = sf.create_select(0,y,V.scaleY_w-1,20,null,'par_sel')
    var lbl = sf.create_label (1,y + 25,'-',10, 'param_value')
    lbl.style.width = V.scaleY_w - 2
    lbl.style.textAlign = 'center'
    lbl.style.userSelect = 'none'
    sel.addEventListener("change", this.change_par_selection.bind(this), true)
    sel.style.border = 'none'
    sel.style.background = V.yAxis_bg_col
    sel.style.webkitAppearance = 'none'
    sel.style.outlineColor = 'transparent'
    sel.style.textAlignLast = 'center'
    bottom_left_div.appendChild(sel)
    bottom_left_div.appendChild(lbl)
    //params_drag.ondrag = this.drag_par_hight
    params_drag.draggable = true
    
    this.create_html_option('vol')
    this.params['vol'] = this.par_default()
    this.create_html_option('*new*')
  }
  
  par_default() {
    return {start:0, scope:128, step:1}
  }
  
  clear(){
    this.ctx.clearRect(0,0,V.win_w,V.params_h)
    this.paths = {}
    this.ctx.fillStyle = V.xAxis_bg_col
    this.ctx.fillRect(0,0, this.cnv.width, this.cnv.height)
    par_sel.innerHTML = ''
    this.create_html_option('vol')
    this.params['vol'] = this.par_default()
    this.create_html_option('*new*')
  }
  
  draw(x,h,it,col){
    var path = new Path2D()
    var y = V.params_h - h
    x = Math.trunc(Math.round(x * 2) / 2)
    y = Math.trunc(Math.round(y * 2) / 2)

    path.rect(x,y,V.params_el_w,h)
    if (!col) col = it.col

    this.ctx.fillStyle = col
    this.ctx.stroke(path)
    this.ctx.fill(path)
  }
  
  set_listener_path(x, it){
    var path = new Path2D()
    x = Math.trunc(Math.round(x * 2) / 2)
    path.rect(x, 0, V.params_el_w, V.params_h)
    this.paths[it.id] = path
  }
  
  remove_listener_path(id){
    delete this.paths[id]
  }

  set_items(){
    var it, x, h, row, param, par_val, col
    this.paths = {}
    if (V.show_parameters) {
      this.ctx.fillStyle = V.xAxis_bg_col
      this.ctx.fillRect(0,0,V.win_w,V.params_h)
      
      if (this.param == 'vol'){
        for (var id in items.dict){
          it = items.dict[id]
          row = it.row
          if (sm.muted[row]) continue
          x = it.x
          h = V.params_h / 128 * it.vol
          this.draw(x,h,it)
          this.set_listener_path(x, it)
        }
      }
      else {
	var scope = this.params[this.param].scope 
	var start = this.params[this.param].start
	
	for (var id in items.dict){
          it = items.dict[id]
          row = it.row
          if (sm.muted[row]) continue
          x = it.x
          this.set_listener_path(x, it)
          param = it.params[this.param]
          
          if (!param) continue
          
          par_val = param[0]
          col = param[1]
          h = V.params_h / scope * (par_val - start)
          this.draw(x,h,it,col)
        }
	
      }
    }
  }
  
  create_html_option(par){
    var option = document.createElement("option");
    option.value = null
    option.text = par
    par_sel.appendChild(option)
  }
  
  change_par_selection(e, arrow){
    var ind, ind2, sel
    if (e != null){
      ind = e.srcElement.selectedIndex
      sel = e.srcElement.options[ind].text
    }
    else {
      var len = par_sel.options.length 
      if (len <= 2) return
      var ind = par_sel.selectedIndex
      ind = (arrow == 'ArrowUp') ? ind - 1 : ind + 1
      if (ind == 1){
        if (arrow == 'ArrowUp') ind -= 1
        else {ind += 1}
      }
      if (ind == -1) ind = len - 1
      if (ind == len) ind = 0
      par_sel.selectedIndex = ind
      sel = par_sel.options[ind].text 
    }
    
    if (sel == '*new*'){
      var name=prompt("Please enter a name for the new parameter. "+
	  "Optional add startvalue, scope and step,"+
	  " devided by a comma. Default is 0, 128, 1 "+
	  " (Won't get saved at the moment)", )
	  this.create_new_par(name)	
    }
    else {
      this.param = sel
    }
    this.set_items()
  }
  
  insert_par(val){
    var name = val[0]
    var par_sett = {start:val[1]*1, scope:val[2]*1, step:val[3]*1}
    this.create_html_option(name)
    this.params[name] = par_sett
  }
  
  create_new_par(name){
    if (name == null ) {
      par_sel.selectedIndex = 0
      return
    } else var new_param = name.split(',')

    // validation
    if (new_param.length == 4){
      var new_name = new_param[0]
      var start = new_param[1] * 1
      var scope = new_param[2] * 1
      var step = new_param[3] * 1
      
      if (!isNaN (new_name) || isNaN(start) || isNaN(scope) || isNaN(step)){
        alert('not a valid entry')
        par_sel.selectedIndex = 0
        return
      }
      var par_sett = {start, scope, step}
    }
    else if (new_param.length == 1) {
      var new_name = new_param[0]
      var par_sett = this.par_default()
    }
    else {
      alert('not a valid entry')
      par_sel.selectedIndex = 0
      return
    }

    this.create_html_option(new_name)
    this.params[new_name] = par_sett
    par_sel.selectedIndex = par_sel.length - 1
    this.param = new_name
    data.send_param_settings(this.param, par_sett)
  }

  set_param(val,par,it){
    if (val == 'del' && par != 'vol') {
      it.set_param(par,'del')
      data.send_item_param(it.id, par, 'del')
    }
    else if (par == 'vol'){
      val = Math.min(Math.trunc(val),127)
      it.set_vol(val)
      main.show_item_pos(it)
      data.send_item_vol(it.id)
    }
    else {      
      it.set_param(par, val)
      data.send_item_param(it.id, par, val)
    }
  }
  
  show_parameter(){
    var val
    var it = items.dict[this.selected[0]]
    if (this.param == 'vol') val = it.vol
    else {
      var v = it.params[this.param]
      if (v) val = v[0]
      else val = '-'
    }
    param_value.innerHTML = val
  }
  
  set_selected(y){
    var scope = this.params[this.param].scope
    var step = this.params[this.param].step
    var start = this.params[this.param].start
    
    var am_steps = scope / step        
    var val = scope - scope / V.params_h * y

    val = round_to_multiple(val,step)
    val += start
    val = Math.min(start + scope, val)
    val = Math.max(start,val)
    
    if (this.param == 'vol'){V.vol = val}
    
    for (var i = 0; i < this.selected.length; i++){
      var it = items.dict[this.selected[i + '']]
      this.set_param(val,this.param,it)
    }
    this.set_items()
  }

  search_for_mousehit(x,y){
    var sel = []
    for (var k in this.paths){
      if (this.ctx.isPointInPath(this.paths[k], x, y)) {
	       sel.push(k*1)
      }
    }
    if (sel.length > 0) {
      this.selected = sel
    }
    else this.selected = []
  }
  
  add_listener(){
    this.cnv.addEventListener("mousemove", this.mousemove.bind(this),true)
    this.cnv.addEventListener("mousedown", this.mousedown.bind(this),true)
    this.cnv.addEventListener("mouseup", this.mouseup.bind(this),true)
    this.cnv.addEventListener("mouseout", this.mouseup.bind(this),true)
    params_drag.addEventListener("drag", this.drag_cnv.bind(this),true)
  }
  
  drag_cnv(e){
    var dy = e.layerY
    if (Math.abs(dy) < 10){
      V.params_h = Math.min(Math.max(V.params_h + dy, V.params_min_height), V.params_max_height)
      gui.adjust_view()
      this.set_items()
    }
  }

  mousemove(e){
    var r = params_cnv.getBoundingClientRect()
    var x = e.clientX - r.left
    var y = e.clientY - r.top;

    if(this.mouse_down && e.ctrlKey){
      this.search_for_mousehit(x,y)
      this.set_selected(y)
    }
    else if (this.mouse_down && this.selected.length > 0){
	this.set_selected(y)
    }
    else {
      this.search_for_mousehit(x,y)
    }
    if (this.selected.length > 0){
      this.show_parameter()
    }
  }

  mousedown(e){
    
    if (e.button == 1 && this.param != 'vol'){
      for (var i = 0; i < this.selected.length; i++){
	var id = this.selected[i]
	var it = items.dict[id]
	this.set_param('del', this.param, it)
      }
      this.set_items()
      this.selected = []
    }
    else {
      this.mouse_down = true
      if (this.selected.length > 0){
        var r = params_cnv.getBoundingClientRect()
        var y = e.clientY - r.top;
        this.set_selected(y)
        this.show_parameter()
      }
    }
  }

  mouseup(e){
    this.mouse_down = false
    this.selected = []
  }
  mouseout(e){
    this.mouse_down = false
    this.selected = []
  }
}
