
const St = imports.gi.St;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const Tweener = imports.ui.tweener;

let text, button,state;

const CapsLockMapped = 'capslock-mapped';
const CapsLockUnMapped = 'capslock-un-mapped';

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
      let result;
      if(arr == [])
        result = GLib.spawn_command_line_sync('gsettings set org.gnome.desktop.input-sources xkb-options ' +'"' +  '[]' + '"');
      else
        result = GLib.spawn_command_line_sync('gsettings set org.gnome.desktop.input-sources xkb-options ' +'"' +  '[' +  arr.toString()+']' + '"');

      return result[0];

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
      let result;
      result = _setKey(arr);
      if(result){
        Main.notify('mapping removed');
        button.child.icon_name = CapsLockUnMapped;
      }
      else{
        Main.notify('There was a problem when remove mapping try again later');
      }
}
function _mapCaptoEscape(arr){
      arr.push("'caps:escape'");
      result = _setKey(arr);
      if(result){
        Main.notify('CapsLock mapped to Escp');
        button.child.icon_name = CapsLockMapped;
      }
      else{
        Main.notify('There was a problem when mapping try again later');
      }

}

function init(extensionMeta) {
    state = false;
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: CapsLockMapped,
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', _toggle);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
    state = _getXKBOptions()[0];
    if(state){
      Main.notify("caps lock already mapped to escape");
      button.child.icon_name = CapsLockMapped;
    }
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
