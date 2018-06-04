
class Main_Gui {
  constructor(){
    this.mouse_pos = {}
  }

  btn_triggered(e,type){

    if (type=="show_parameters") {
      V.show_parameters = !V.show_parameters
      this.set_col(type,V.show_parameters)
      gui.adjust_view()
    }
    else if(type=="show_player"){
      V.show_player = !V.show_player
      this.set_col(type,V.show_player)
      gui.adjust_view()
    }
    else if(type=="show_solo"){
      V.show_solo = !V.show_solo
      V.scaleY_w = V.numbers_w + V.show_solo * V.solo_w
      this.set_col(type,V.show_solo)
      gui.adjust_view()
    }
    else if(type=="call_settings"){
      this.call_settings(e)
    }
    else if(type=="call_midi"){
      this.call_midi(e)
    }
    else if(type=="clear"){
      gui.clear_sequencer()
      items.clear_vars()
      params.clear()
      data.send_data('memory clear', window.win_nr)
    }
    else if(type=="test"){
      this.call_test()
    }
    else if(type=="face"){
      open_description(e)
    }
  }

  set_col(name,val){
    var c = window.document.getElementById(name)
    c.style.fill = val ? 'orange' : 'rgb(128,0,64)'
  }

  create_btn(x,y,w,h,stroke_w,svg_str,classes,type, _var) {
    var path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    path.setAttributeNS(null, "d", svg_str);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.style.strokeWidth = stroke_w
    svg.style.zIndex = 30
    svg.setAttribute("class", classes)
    svg.style.position="absolute"
    svg.style.width = w
    svg.style.height = h
    svg.style.left = x
    svg.style.top = y
    svg.id = type
    if(_var){
      svg.style.fill = _var ? 'orange' : 'rgb(128,0,64)'
    }
    svg.appendChild(path)

    var attr =  "translate(-120 -115) scale(0.1)"
    svg.setAttribute("transform", attr);
    svg.addEventListener("click", e => {main.btn_triggered(e,type)});

    return svg
  }



  create_main() {
    var cnv = document.getElementById('canvas_main')
    var ctx = cnv.getContext('2d')
    ctx.fillStyle = V.main_bg_col
    ctx.fillRect(0,0, cnv.width, cnv.height)

    btn = this.create_btn(0, 0, 1200,1000, 12, svg_str.faces_str1,
       'player_svg player_click','face', true)
    var attr =  "translate(-582 -482) scale(0.028)"
    btn.setAttribute("transform", attr);
    main_div.appendChild(btn)

    btn = this.create_btn(0, 0, 1200,1000, 12, svg_str.faces_str2,
       'player_svg player_click','face')
    btn.setAttribute("transform", attr);
    main_div.appendChild(btn)

    var main_cont = document.getElementById('main_div')
    var nr = sf.create_nr(45, 2, 30, 0, 99, 1, V.set_bars, V.amount_bars)
    nr.style.background = V.main_bg_col
    nr.style.margin = 0
    nr.style.outlineColor = 'transparent'
    nr.style.border = 'none'

    main_cont.appendChild(nr)
    main_cont.appendChild(sf.create_label(58, 2, 'bars', 11))

    var nr = sf.create_nr(45, 21, 36, 1, 15, 1, V.set_micro, V.micro)
    nr.style.background = V.main_bg_col
    nr.style.margin = 0
    nr.style.outlineColor = 'transparent'
    nr.style.border = 'none'
    main_cont.appendChild(nr)
    main_cont.appendChild(sf.create_label(58, 21, '/4', 11))

    main_cont.appendChild(sf.create_svg_radio(90, 20, 'quant_radios', 'radio', V.set_quant, 8, 3))
    main_cont.appendChild(sf.create_label(90, 0, 'Q', 16));
    main_cont.appendChild(sf.create_label(110, 4, '1/8 norm', 10, 'quant'))

    main_cont.appendChild(sf.create_svg_btn(200, 20, 'use_tr', 'toggle', V.set_use_triplets))
    main_cont.appendChild(sf.create_label(192, 4, 'triplets', 10, 'tripl'))

    main_cont.appendChild(sf.create_svg_btn(230, 20, 'use_q', 'toggle', V.set_use_quant))
    main_cont.appendChild(sf.create_label(232, 4, 'use', 10, 'use_q'))

    main_cont.appendChild(sf.create_label(275, 4, 'ITEM', 12))
    main_cont.appendChild(sf.create_label(310, 4, 'row 18 start 4.4.87 len 0.0.12 vol 96', 10, 'item'))

    main_cont.appendChild(sf.create_label(275, 24, 'MOUSE', 12));
    main_cont.appendChild(sf.create_label(325, 24, 'row 18 pos 4.4.87', 10, 'mouse'))

    var btn = this.create_btn(510, 0, 250 ,250, 1, svg_str.play_btn_str,'player_svg','show_player', V.show_player)
    main_cont.appendChild(btn)
    btn = this.create_btn(535, 0, 250 ,250, 1, svg_str.attachment_str,'player_svg','show_parameters', V.show_parameters)
    main_cont.appendChild(btn)
    btn = this.create_btn(560, 0, 250 ,250, 1, svg_str.solo_str,'player_svg','show_solo', V.show_solo)
    main_cont.appendChild(btn)


    btn = this.create_btn(510, 20, 250 ,250, 1, svg_str.clear_str,'player_svg player_click','clear')
    main_cont.appendChild(btn)
    btn = this.create_btn(535, 20, 250 ,250, 1, svg_str.midi_str,'player_svg player_click','call_midi')
    main_cont.appendChild(btn)
    btn = this.create_btn(560, 20, 250 ,250, 1, svg_str.settings_str,'player_svg player_click','call_settings')
    main_cont.appendChild(btn)


    btn = this.create_btn(585, 20, 250 ,250, 1, svg_str.test_str,'player_svg player_click','test')
    main_cont.appendChild(btn)
  }

  call_settings(e) {
    load_scripts_otf({fkt:'open_settings',scripts:['init/settings'],args:e})
  }
  call_midi(e) {
    var x = e.screenX - 190
    var y = e.screenY + 60
    open_win(x,y,390,220,'midi_win',"midi/midi.html", midi_dialog.create_midi_dialog)
  }
  call_test() {
    load_scripts_otf({fkt:'test',scripts:['test/test'],args:[]})
  }
  show_mouse_pos(bar, micro, cent, row) {
    var lbl = document.getElementById('mouse')
    var p = '.'
    var start = bar + p + micro + p + cent
    row += 1
    lbl.innerHTML = "row " + row + " pos " + start
    this.mouse_pos = {bar,micro,cent,row}
  }

  show_item_pos(it) {
    var lbl = document.getElementById('item')
    var p = '.'
    var sp = ' '

    if (it.cent < 10) {var c = '0' + it.cent.toString()}
    else {var c = it.cent.toString()}
    if (it.len_cent < 10) {var lc = '0' + it.len_cent.toString()}
    else {var lc = it.len_cent.toString()}
    var start = 'start ' + it.bar + p + it.micro + p + c + sp
    var len = 'len ' + it.len_bar + p + it.len_micro + p + lc + sp
    var vol = 'vol ' + it.vol
    var row = 'row ' + (it.row + 1) + sp

    lbl.innerHTML = row + start + len + vol
  }

  toggle_main() {
    V.show_main = !V.show_main
    gui.adjust_view()
  }
}

main = new Main_Gui()

function open_description(e) {
  var x = e.screenX - 190
  var y = e.screenY + 60
  open_win(x,y,600,600,'description_win',"init/description.html")//, on_load_description)
}
