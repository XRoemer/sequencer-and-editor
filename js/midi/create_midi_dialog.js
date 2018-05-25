class Midi_Dialog {
  constructor(){

  }

  create_midi_dialog(win) {

    var doc = window.midi_win.document
    var cnv = doc.getElementById('midi_cnv')
    var ctx = cnv.getContext('2d')
    ctx.fillStyle = 'rgba(245, 245, 215, 1)'
    ctx.fillRect(0,0, cnv.width, cnv.height)

    var ctrl_cont = doc.getElementById('midi_div')

    ctrl_cont.appendChild(sf.create_btn(20, 6, 12, 'open_file', midi_dialog.open_midi_file));
    ctrl_cont.appendChild(sf.create_label(38, 6, 'open file', 10))
    ctrl_cont.appendChild(sf.create_label(20, 22, '- filename -', 10,'midi_filename'))
    ctrl_cont.appendChild(sf.create_btn(20, 90, 12, 'to_editor', midi_dialog.set_selection_to_editor));
    ctrl_cont.appendChild(sf.create_label(38, 90, 'to editor', 10))

//    ctrl_cont.appendChild(sf.create_label(20, 72, 'import bars:(not working)', 10,'lbl_amount_bars'))
//
//    ctrl_cont.appendChild(sf.create_nr(20, 90, 36, 1, 1000, 1, midi_dialog.set_midi_start_bar));
//    ctrl_cont.appendChild(sf.create_label(58, 90, 'start', 10));
//    ctrl_cont.appendChild(sf.create_nr(90, 90, 36, 1, 1000, 1, midi_dialog.set_midi_end_bar));
//    ctrl_cont.appendChild(sf.create_label(128, 90, 'end', 10));

    var sel = sf.create_select(20, 54, 100, 20, midi_dialog.select_track, 'select_track')
    ctrl_cont.appendChild(sel);
    ctrl_cont.appendChild(sf.create_btn(20,140, 12, 'midi_dialog.midi_to_player', midi_dialog.midi_to_player));
    ctrl_cont.appendChild(sf.create_label(38, 140, 'midi to player', 10))
  }

  open_midi_file(){
    var input = document.createElement('input');
    input.type = 'file'
    input.click()
    input.onchange = midi_dialog.get_chosen_file
  }

  get_chosen_file(e) {
    var doc = window.midi_win.document
    var fn_lbl = doc.getElementById('midi_filename')
    fn_lbl.innerText = e.path[0].value
    chrome.windows.update(window.midi_win.id, {focused : true});
    midi_dialog.parse_file()
  }

  midi_to_player(e){
    try {
      data.send_data('memory clear', window.win_nr)
      var arr = notes.result[notes.selected_track]
      data.send_data('outlet lowest_note '+ arr.lowest_note, window.win_nr)
      for (i = 0; i < arr.val_array.length ; i++) {
        var el = arr.val_array[i]
        data.send_new_item(el[0],el[1],el[2]+1,el[3]+1,el[4],el[5],el[6],el[7],el[8])
      }
    }
    catch(e){log(e)}
  }

  parse_file(){
    var doc = window.midi_win.document
    var file = doc.getElementById('midi_filename').textContent
    load_scripts_otf({fkt:'mfp',scripts:['midi/Notes','midi/midi-file-parser'],args:[file,]})
  }

  set_midi_start_bar(e){
    log(e)
  }

  set_midi_end_bar(e){
    log(e)
  }

  select_track(e){
    notes.selected_track = e.srcElement.selectedIndex
  }

  set_selection_to_editor(){
    try {
      var arr = notes.result[notes.selected_track]
      items.set_items(arr.val_array, window.win_nr)
    }
    catch(e) {log(e)}
  }
}

midi_dialog = new Midi_Dialog()
