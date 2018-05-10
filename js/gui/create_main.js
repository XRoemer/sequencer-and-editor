
class Main_Gui {
  constructor(){
  }
  
  btn_triggered(e,type){    
    if (type=="show_parameters") {
      show_parameters = !show_parameters
      this.set_col(type,show_parameters)
      main.adjust_view()
    } 
    else if(type=="show_player"){
      show_player = !show_player
      this.set_col(type,show_player)
      main.adjust_view()
    }
    else if(type=="call_settings"){
      this.call_settings(e)
    }
    else if(type=="call_midi"){
      this.call_midi(e)
    }
    else if(type=="clear"){
      clear_sequencer()
      send_data('memory clear', window.win_nr)
    }
    else if(type=="test"){
      this.call_test()
    }
  }
  
  set_col(type,val){
    var c = window.document.getElementById(type)
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
  
  adjust_view(){
    if(show_main){
      main_div.style.visibility = 'visible'
    } else main_div.style.visibility = 'hidden'
      
    if(show_player){
      player_div.style.visibility = 'visible'
      player_div.style.top = ctrl_h * show_main
    } else player_div.style.visibility = 'hidden'
      
    if(show_parameters){
      params_div.style.visibility = 'visible'
      params_div.style.top = ctrl_h * show_main + player_h * show_player + scaleX_h + win_h
      params_div.style.height = params_h
      params_cnv.style.height = params_h
      bottom_left.style.visibility = 'visible'
      bottom_left.style.height = params_h
    } else {
      	params_div.style.visibility = 'hidden'
	params_div.style.height = 0
	params_cnv.style.height = 0
	bottom_left.style.visibility = 'hidden'
	bottom_left.style.height = 0
    }
      
    seq_container.style.top = player_h * show_player + ctrl_h * show_main 
    sequencer.style.top = scaleX_h 
    sequencer_bg.style.top = scaleX_h
    canvas_bg.style.top = scaleX_h
    scales.style.top = ctrl_h * show_main + player_h * show_player
    transport.style.top = ctrl_h * show_main + player_h * show_player
  }
  
  create_main() {
    var cnv = document.getElementById('canvas_main')
    var ctx = cnv.getContext('2d')
    ctx.fillStyle = 'rgba(245, 245, 215, 1)'
    ctx.fillRect(0,0, cnv.width, cnv.height)

    var main_cont = document.getElementById('main_div')

    main_cont.appendChild(create_nr(10, 2, 36, 0, 100, 1, set_bars, amount_bars))
    main_cont.appendChild(create_label(48, 2, 'bars', 12))
    
    main_cont.appendChild(create_nr(10, 21, 36, 1, 15, 1, set_micro, micro))
    main_cont.appendChild(create_label(48, 21, '/4', 12))

    main_cont.appendChild(create_svg_radio(80, 20, 'quant_radios', 'radio', set_quant, 8, 3))
    main_cont.appendChild(create_label(80, 0, 'Q', 16));
    main_cont.appendChild(create_label(100, 4, '1/8 norm', 10, 'quant'))

    main_cont.appendChild(create_svg_btn(190, 20, 'use_tr', 'toggle', set_use_triplets))
    main_cont.appendChild(create_label(182, 4, 'triplets', 10, 'tripl'))

    main_cont.appendChild(create_svg_btn(220, 20, 'use_q', 'toggle', set_use_quant))
    main_cont.appendChild(create_label(222, 4, 'use', 10, 'use_q'))

    main_cont.appendChild(create_label(265, 4, 'ITEM', 12))
    main_cont.appendChild(create_label(300, 4, 'row 18 start 4.4.87 len 0.0.12 vol 96', 10, 'item'))

    main_cont.appendChild(create_label(265, 24, 'MOUSE', 12));
    main_cont.appendChild(create_label(315, 24, 'row 18 pos 4.4.87', 10, 'mouse'))
    
    var btn = main.create_btn(500, 0, 250 ,250, 1, svg_str.play_btn_str,'player_svg','show_player', show_player)
    main_cont.appendChild(btn)
    btn = main.create_btn(500, 20, 250 ,250, 1, svg_str.attachment_str,'player_svg','show_parameters', show_parameters)
    main_cont.appendChild(btn)
    
    btn = main.create_btn(525, 0, 250 ,250, 1, svg_str.settings_str,'player_svg player_click','call_settings')
    main_cont.appendChild(btn)
    btn = main.create_btn(525, 20, 250 ,250, 1, svg_str.midi_str,'player_svg player_click','call_midi')
    main_cont.appendChild(btn)
    
    btn = main.create_btn(550, 0, 250 ,250, 1, svg_str.clear_str,'player_svg player_click','clear')
    main_cont.appendChild(btn)
//    btn = main.create_btn(550, 20, 250 ,250, 1, svg_str.test_str,'player_svg player_click','test')
//    main_cont.appendChild(btn)   
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
  }

  show_item_pos(it) {
    lbl = document.getElementById('item')
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
    show_main = !show_main
    if (show_main) {
      var attr =  "translate(-135 -135) scale(0.1) rotate(0)"
      hide.setAttribute("transform", attr);
    } else {
      var attr =  "translate(-135 -135) scale(0.1) rotate(180)"
      hide.setAttribute("transform", attr);
    }
    main.adjust_view()
  }
}

main = new Main_Gui()








	