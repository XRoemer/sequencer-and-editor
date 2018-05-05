function create_menu() {
  // Get the current window
  var win = gui.Window.get();
  // Create a menubar for window menu
  var menubar = new gui.Menu({ type: 'menubar' });
  // Create a menuitem
  var sub1 = new gui.Menu();


  sub1.append(new gui.MenuItem({
  label: 'Test1',
  click: function() {
    log(items.dict)
  }
  }));
  sub1.append(
    new gui.MenuItem({
      label: 'Test2',
      click: function() {
        client.write('Hello, server! 0 Love, Client.');
        console.log('mess to serv');
        set_event()
      }
  }));

  menubar.append(new gui.MenuItem({ label: 'functions', submenu: sub1}));
  win.menu = menubar;
}
