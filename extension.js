
const St = imports.gi.St;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;

let text, button,state;

function _getKey(){
      let result=GLib.spawn_command_line_sync('gsettings get org.gnome.desktop.input-sources xkb-options')[1].toString().trim();

      if(result == '@as []')
        return []
      //remove '[' && ']'
      result = result.substring(1,result.length-1);
      //convert string result to array
      let lstResult=result.split(',');

      return lstResult;
}

function _setKey(arr){
      if(arr == [])
        GLib.spawn_command_line_sync('gsettings set org.gnome.desktop.input-sources xkb-options ' +'"' +  '[]' + '"');
      else
        GLib.spawn_command_line_sync('gsettings set org.gnome.desktop.input-sources xkb-options ' +'"' +  '[' +  arr.toString()+']' + '"');

}
function _getXKBOptions(){
      let result = _getKey();
      let newList=[];
      let found = false;

      result.forEach(function(element,index,array){
        element = element.trim();
        let len = element.length;
        if(element.substring(1,len-1) == 'caps:escape')
           found = true;
        else
          newList.push(element);
      })

      return [found,newList];
}

function _toggle(){
      let result;
      [state,result] = _getXKBOptions();
      state ? _removeMap(result):_mapCaptoEscape(result);
}

function _removeMap(arr){
      _setKey(arr);
}
function _mapCaptoEscape(arr){
      arr.push("'caps:escape'");
      _setKey(arr);
}

function init() {
    state = false;
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', _toggle);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
    state = _getXKBOptions()[0];
    if(state)
      Main.notify("caps lock already mapped to escape");
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
