

class Player {
  constructor() {
    this.status = null
    this.use_bounds = false
    this.loop_on = false
  }
  
  init() {
    if(pointer.scroll_window) this.set_col_active('scroll_window')
    else this.set_col_inactive('scroll_window')
    if(this.use_bounds) this.set_col_active('loop_bounds')
    else this.set_col_inactive('loop_bounds')
    if(this.loop_on) this.set_col_active('loop')
    else this.set_col_inactive('loop')
  }


  create_player() {
    player_bg.width = V.win_w
    var ctx = player_bg.getContext('2d')
    ctx.fillStyle = 'rgba(160,140, 140, 1)'
    ctx.fillRect(0,0, player_bg.width, player_bg.height)

    var h = 0
    var xx = 30
    var x = 30
    var w = 2
    var attr =  "translate(-135 -135) scale(0.1)"

    var btn = sf.create_player_btn(x, h, 300 ,300, w, svg_str.back_btn_str,'back','player_svg player_click')
    btn.setAttribute("transform", attr);
    btn.addEventListener("click", e => {this.btn_triggered('back')});
    player_div.appendChild(btn)
    x += xx
    var btn = sf.create_player_btn(x, h, 300 ,300, w, svg_str.stop_btn_str,'stop','player_svg player_click')
    btn.setAttribute("transform", attr);
    btn.addEventListener("click", e => {this.btn_triggered('stop')});
    player_div.appendChild(btn)
    x += xx
    var btn = sf.create_player_btn(x, h, 300 ,300, w, svg_str.play_btn_str,'play','player_svg')
    btn.setAttribute("transform", attr);
    btn.addEventListener("click", e => {this.btn_triggered('play')});
    player_div.appendChild(btn)
    x += xx
    var btn = sf.create_player_btn(x, h, 300 ,300, w, svg_str.pause_btn_str,'pause','player_svg')
    btn.setAttribute("transform", attr);
    btn.addEventListener("click", e => {this.btn_triggered('pause')});
    player_div.appendChild(btn)
    x += xx
    var btn = sf.create_player_btn(x, h, 300 ,300, w, svg_str.loop_btn_str,'loop','player_svg')
    btn.setAttribute("transform", attr);
    btn.addEventListener("click", e => {this.btn_triggered('loop')});
    player_div.appendChild(btn)

    x += xx
    var btn = sf.create_player_btn(x, h, 300 ,300, w, svg_str.bounds_btn_str,'loop_bounds','player_svg')
    btn.setAttribute("transform", attr);
    btn.addEventListener("click", e => {this.btn_triggered('loop_bounds')});
    player_div.appendChild(btn)

    x += xx + xx
    var btn = sf.create_player_btn(x, h, 300 ,300, w, svg_str.scroll_btn_str,'scroll_window','player_svg')
    btn.setAttribute("transform", attr);
    btn.addEventListener("click", e => {this.btn_triggered('scroll_window')});
    player_div.appendChild(btn)
  }

  set_col_inactive(type) {
    var c = window.document.getElementById(type)
    c.style.fill = 'rgb(128,0,64)'
  }
  set_col_active(type) {
    var c = window.document.getElementById(type)
    c.style.fill = 'orange'
  }

  btn_triggered(type){
    if (['play','stop','pause'].includes(type)){
      this.status = type
    }
    if (type=="play") {
      data.send_data('player ' + type, window.win_nr)
      this.set_col_active(type)
      this.set_col_inactive("pause")
      this.set_col_inactive("stop")
      pointer.stop_pointer()
    }
    else if (type=="stop") {
      data.send_data('player ' + type, window.win_nr)
      this.set_col_active(type)
      this.set_col_inactive("play")
      this.set_col_inactive("pause")
      pointer.stop_pointer()
    }
    else if (type=="pause") {
      data.send_data('player ' + type, window.win_nr)
      this.set_col_active(type)
      this.set_col_inactive("play")
    }
    else if (type=="back") {
      data.send_data('player ' + type, window.win_nr)
      //this.set_col_active(type)
      this.set_col_inactive("pause")
      pointer.set_position(0)
      data.send_data('player pointer_start 1 1 0' , window.win_nr)
      window.scrollTo({left:0})
    }
    else if (type=="loop") {
      this.loop_on = !this.loop_on
      var val = this.loop_on ? 1 : 0
      data.send_data('player ' + type + ' ' + val, window.win_nr)
      if (this.loop_on){this.set_col_active(type)}
      else {this.set_col_inactive(type)}
    }
    else if (type=="loop_bounds") {
      this.use_bounds = !this.use_bounds
      if (this.use_bounds) {this.set_col_active(type)}
      else {this.set_col_inactive(type)}
      var val = this.use_bounds ? 1 : 0
      data.send_data('player ' + type + ' ' + val, window.win_nr)
    }
    else if(type == "scroll_window") {
      pointer.scroll_window = !pointer.scroll_window
      if (pointer.scroll_window) {this.set_col_active(type)}
      else {this.set_col_inactive(type)}
    }
  }
}
