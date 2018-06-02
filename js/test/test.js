function test() {

  try {
    
    var ids = Object.keys(items.dict)
    var nr = ids.sort(this.sortNumber).slice(-1)[0]
    var new_id = nr * 1 + 1
  
    log(new_id,ids)

    
    
  }
  catch(e){log(e)}
}
