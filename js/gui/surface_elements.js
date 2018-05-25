
class Surface {
  constructor(doc){
    this.doc = doc
  }
  
  create_btn(x,y,font_size,name,fkt) {
    var btn = this.doc.createElement("BUTTON");
    var t = this.doc.createTextNode('');
    btn.appendChild(t);
    btn.onclick = fkt
    btn.id = name
    btn.style.position = 'absolute'
    btn.style.top = y
    btn.style.left = x
    btn.style.height = 12
    btn.style.width = 8
    return btn
  }

  create_label (x,y,txt,font_size, id) {
    var newlabel = this.doc.createElement("LABEL");
    newlabel.style.left = x.toString() + 'px'
    newlabel.style.top = y.toString() + 'px'
    newlabel.style.position = "absolute"
    newlabel.innerHTML = txt;
    newlabel.id = id
    newlabel.style.fontSize = font_size.toString() + 'px'
    return newlabel
  }

  create_nr(x, y, _width, _min, _max, _step, fkt, def, wheel_fkt, var_name) {
    var input = this.doc.createElement("input");
    input.type = "number";
    input.name = "points"
    input.min = _min
    input.max = _max
    input.step = _step
    input.value = def ? def : 0
    input.onchange = fkt
    input.style = "position:absolute; font-size:11px; top:" + y.toString() + "px; left:" + x.toString() + "px; max-width:" + _width.toString() + "px"
    if (wheel_fkt){
      input.addEventListener("wheel", function(e) {
        input.var_name = var_name
        wheel_fkt(e,_min,_max)
      }, false);
    }
    return input
  }

  create_select(x, y, w, h, fkt, id_name) {
    var input = this.doc.createElement("select");
    input.onchange = fkt
    input.id = id_name
    input.style = "position: absolute; width:" + w + "; top:" +
      y + "px; left:" + x + "px;"
    return input
  }

  create_color_picker(x, y, w, h, id, col, fkt) {
    var input = this.doc.createElement("INPUT");
    input.type = "color";
    input.onchange = fkt
    input.id = id
    input.style.position = "absolute"
    input.style.width = w
    input.style.height = h
    input.style.top = y
    input.style.left = x
    input.value = rgbToHex(col[0], col[1],col[2])
    return input
  }

  create_stroke(x1,y1,x2,y2,w,col,id) {
    var c=this.doc.getElementById("canvas_bg");
    var ctx=c.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = w;
    ctx.strokeStyle = col
    ctx.stroke();
  }

  create_stroke_svg(x,y,w,h, stroke_w,col,id) {
    var path = this.doc.createElementNS("http://www.w3.org/2000/svg", 'path')
    var str = 'M 0 0 L 0 ' + V.win_h
    path.setAttributeNS(null, "d", str);
  
    var svg = this.doc.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.style.stroke = col
    svg.setAttributeNS(null, "stroke-width", stroke_w);
    svg.style.position="absolute"
    svg.style.width = w
    svg.style.height = h
    svg.style.left = x
    svg.style.top = y
    svg.id = id
    svg.appendChild(path);
    return svg
  }

  create_triad(x,y,w,h, stroke_w,col,id,fill,str) {
    if (fill == null) {fill = 'rgb(128,0,64)'}
    if (str == null) {str = 'M 7.5 20 L 0 0 L 15 0 Z'}
  
    var path = this.doc.createElementNS("http://www.w3.org/2000/svg", 'path')
    path.setAttributeNS(null, "d", str);
    var svg = this.doc.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.style.stroke = col
    svg.style.fill = fill
    svg.setAttributeNS(null, "stroke-width", stroke_w);
    svg.setAttributeNS(null, "z-index", 30);
    svg.style.position="absolute"
    svg.style.width = w
    svg.style.height = h
    svg.style.left = x
    svg.style.top = y
    svg.id = id
    svg.appendChild(path);
    return svg
  }

  create_svg_btn(x,y,id,type,fkt,sel) {
    var w = SVGs.r_bound
    var h = SVGs.r_bound
    var stroke_w = SVGs.stroke_w
    var path = this.doc.createElementNS("http://www.w3.org/2000/svg", 'path')
    path.setAttributeNS(null, "d", SVGs.btn_str);
    var svg = this.doc.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttributeNS(null, "stroke-width", stroke_w);
    svg.setAttributeNS(null, "z-index", 30)
    if (sel) {var col = V.col_btn_active}
    else {col = V.col_btn_inactive }
    svg.style.fill = col
    svg.style.stroke = 'black'
    svg.style.position="absolute"
    svg.style.width = w
    svg.style.height = h
    svg.style.left = x
    svg.style.top = y
    svg.id = id
    if (type == 'button'){svg.onclick = fkt}
    else if (type == 'toggle') {
      svg.onclick = sf.svg_toggle
      svg.fkt = fkt
    }
    svg.appendChild(path);
    svg.state = false
    return svg
  }
  

  create_svg_radio(x,y,id,type,fkt,amount,sel) {
    var w = SVGs.r_bound
    var stroke_w = SVGs.stroke_w
    var container = this.doc.createElement("div");
    container.style.position = 'absolute'
    container.style.left = x.toString() + 'px'
    container.style.top = y.toString() + 'px'
  
    var pos = 0
    for(var i=0; i< amount; i++) {
      if (i == sel) {var active = true}
      else {var active = false}
      var btn = sf.create_svg_btn(pos,0,i,'toggle',fkt, active)
      btn.type = 'radio'
      btn.fkt = fkt
      btn.container = container
      container.appendChild(btn)
      pos += w
    }
    return container
  }

  svg_toggle(e) {
    var par = e.srcElement.parentElement
    par.state = !par.state
  
    if (par.state) {par.style.fill = 'orange'}
    else {par.style.fill = 'rgb(200,200,200)'}
    if (par.type != 'radio') {par.fkt(e)}
    else {
      sf.toggle_radios(e)
      par.fkt(parseInt(par.id))
    }
  }

  toggle_radios(e) {
    var par = e.srcElement.parentElement
    var childs = par.container.children
    var amount = childs.length
  
    for(var i=0; i< amount; i++) {
      if (i != parseInt(par.id)){
        var par2 = childs[i]
        par2.state = false
        par2.style.fill = 'rgb(200,200,200)'
      }
    }
  }

  create_player_btn(x,y,w,h, stroke_w,str,id,classes) {
    var path = this.doc.createElementNS("http://www.w3.org/2000/svg", 'path')
    path.setAttributeNS(null, "d", str);
  
    var svg = this.doc.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttributeNS(null, "stroke-width", stroke_w);
    svg.setAttributeNS(null, "z-index", 30);
    svg.setAttribute("class", classes)
    svg.style.position="absolute"
    svg.style.width = w
    svg.style.height = h
    svg.style.left = x
    svg.style.top = y
    svg.id = id
    svg.appendChild(path);
    return svg
  }
  
}

var sf = new Surface(document)
