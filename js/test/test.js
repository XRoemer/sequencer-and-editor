function test() {

  try {

      
//     var wins = gui.global.__nw_windows
//     var keys = Object.keys(wins) 
//     var win_nrs = []
//     keys.forEach(function(e) {
//       win_nrs.push(wins[e][0].window.win_nr)
//       })
//     win_nrs.sort()  
//     var is_win_with_lowest_nr = window.win_nr == win_nrs[0].toString()
     
    log(window.id)

  }
  catch(e){log(e)}
}



function my_fkt(id) {
  log('toggle',id)
}

function myFunction(e){
  log('hier', e)
}
