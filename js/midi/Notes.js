
var Notes = class Notes {

  constructor(midi) {
    this.midi = midi
    this.ticksPerBeat = 480

    this.meta = {}
    this.tracknames = {}
    this.track_events = {}
    this.result = {}
    this.selected_track = 0

    this.timeSignatures_dict = {}
    this.timeSignatures_arr = []
    this.num = 4
    this.denom = 4 // not used yet

    this.tempos_dict = {}
    this.tempos_arr = []
    this.tempo = 60 // not used yet

    // catching unused vars for later handling
    this.not_catched_meta_events = {}
    this.other_types = {}
    this.other_events = {}
    this.errors = []
  }

  calc_notes() {

    this.get_meta_events()
    this.ticksPerBeat = this.midi.header.ticksPerBeat

    var first_timeSignature = this.timeSignatures_arr[0]
    var first_tempo = this.tempos_arr[0] // not used yet

    for (var i = 0; i < this.midi.tracks.length ; i++) {
      this.num = first_timeSignature[0]
      this.denom = first_timeSignature[1] // not used yet
      this.tempo = first_tempo // not used yet
      this.get_track_events(i)
    }

    if (this.errors.length > 0){
      log('ERRORS', this.errors)
    }
  }

  get_track_events(nr) {

    var track = this.midi.tracks[nr]
    var id = 0
    var delta = 0
    var note_events = {}
    var noteNumber_id = {}

    for (var i = 0; i < track.length ; i++) {

      var ev = track[i]
      delta += ev.deltaTime
      id = this.get_note(ev, delta, id, noteNumber_id, note_events, nr)
    }
    this.track_events[nr] = note_events
  }

  get_note(ev, delta, id, noteNumber_id, note_events, nr){
    if (ev.type == 'channel' ) {
      // this method gets noteOn and noteOff events and combines them
      // in the same dict 'note_events'
      if (ev.subtype == 'noteOn') {

        var n = this.get_bmc_nv(ev, delta)

        n.bar += 1
        n.micro += 1

        note_events[id] = {
          delta:delta,
          bar:n.bar,
          micro:n.micro,
          cent:n.cent,
          note:n.note,
          vol:n.vol
        }

        if (!noteNumber_id[n.note]){
          noteNumber_id[n.note] = [id]
        } else {
          noteNumber_id[n.note].push(id)
        }
        id += 1
      }
      else if (ev.subtype == 'noteOff') {
        var note = ev.noteNumber
        var id2 = noteNumber_id[note][0]

        if (id2 == null) {
          var n = this.get_bmc(delta)
          this.errors.push([nr, this.get_bmc(delta), 'no id'])
          return id
        }
        var n_ev = note_events[id2]
        if (n_ev == null) {
          this.errors.push([nr, this.get_bmc(delta), 'no event'])
          n = {bar:0,micro:0,cent:10}
          return id
        }
        var del = delta - n_ev.delta
        var n = this.get_bmc(del)

        n_ev['bar_len'] = n.bar
        n_ev['micro_len'] = n.micro
        n_ev['cent_len'] = n.cent
        noteNumber_id[note].splice(0,1)
      }
      else if (ev.subtype) {
        var n = this.get_bmc_nv(ev)
        this.other_events[id] = {info:n,ev:ev}
      }
    }
    else {
      this.other_types[delta] = ev
    }
    return id
  }

  get_meta_events() {
    var tr = this.midi.tracks

    for (var i = 0; i < tr.length; i++) {

      var delta = 0
      for (var j = 0; j < tr[i].length; j++) {
        var ev = tr[i][j]
        delta += ev.deltaTime

        if(ev.type == 'meta'){
          if (ev.subtype == 'timeSignature'){this.timeSignatures_dict[delta]= [ev.numerator,ev.denominator]}
          else if (ev.subtype == 'setTempo'){this.tempos_dict[delta] = ev.microsecondsPerBeat}
          else if (ev.subtype == 'trackName'){this.tracknames[i] = [i, ev.text]}
          else {this.not_catched_meta_events[delta] = ev}
        }
      }
    }
    this.timeSignatures_arr = dict_to_arr(this.timeSignatures_dict)
    this.tempos_arr = dict_to_arr(this.tempos_dict)
  }


  get_bmc_nv(ev, delta){
    var tmp = parseInt(delta / this.ticksPerBeat)
    var bar = parseInt(tmp / this.num)
    var micro = tmp % this.num
    var cent = Math.round(
        (delta
          - (bar * this.ticksPerBeat * this.num)
          - (micro * this.ticksPerBeat)
        )
        / this.ticksPerBeat * 100
      )
    var note = ev.noteNumber
    var vol = ev.velocity

    return {bar,micro,cent,note,vol}
  }
  get_bmc(delta){
    var tmp = parseInt(delta / this.ticksPerBeat)
    var bar = parseInt(tmp / this.num)
    var micro = tmp % this.num
    var cent = Math.round(
        (delta
          - (bar * this.ticksPerBeat * this.num)
          - (micro * this.ticksPerBeat)
        )
        / this.ticksPerBeat * 100
      )
    return {bar,micro,cent}
  }
}


function create_val_array(n_ev){
  var val_array = []
  var len = Object.keys(n_ev).length;
  var lowest_note = 500

  for (var i = 0; i < len ; i++) {
    var n = n_ev[i]
    lowest_note = (lowest_note > n.note) ? n.note : lowest_note
  }
  for (var i = 0; i < len ; i++) {
    var n = n_ev[i]
    var note = n.note - lowest_note
    val_array.push([i,note,n.bar,n.micro,n.cent,n.bar_len,n.micro_len,n.cent_len,n.vol])
  }
  return {val_array,lowest_note}
}

function mfp(args) {

  var path = args[0]
  var file = require('fs').readFileSync(path, 'binary')
  var midi = MidiFile(file);
  notes = new Notes(midi)
  notes.calc_notes()
  set_tracknames(notes.tracknames)

  for (nr in notes.track_events) {
    var res = create_val_array(notes.track_events[nr])
    notes.result[nr] = {val_array:res.val_array, lowest_note:res.lowest_note}
  }
}

function set_tracknames(tr){

  var doc = window.midi_win.document
  var sel = doc.getElementById('select_track')
  sel.options.length = 0
  var len = Object.keys(tr)

  for (var prop in tr) {
      var option = document.createElement("option");
      option.value = tr[prop][0];
      option.text = tr[prop][1];
      sel.appendChild(option);
  }
}
