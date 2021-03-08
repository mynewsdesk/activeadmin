// Patched version of (an old version of) https://git.io/fjf1b to support the custom
// "batch_update_attr" input type and force the modal width to 600.

function ModalDialog(message, inputs, callback){
  let html = `<form id="dialog_confirm" title="${message}"><ul>`;
  for (let name in inputs) {
    var elem, opts, wrapper;
    let type = inputs[name];
    if (/^(datepicker|checkbox|text|number|batch_update_attr)$/.test(type)) {
      wrapper = 'input';
    } else if (type === 'textarea') {
      wrapper = 'textarea';
    } else if ($.isArray(type)) {
      [wrapper, elem, opts, type] = ['select', 'option', type, ''];
    } else if ($.isPlainObject(type) && type.multiple) {
      [wrapper, elem, opts, type] = ['select', 'option', type.multiple, 'multiple']
    } else {
      throw new Error(`Unsupported input type: {${name}: ${type}}`);
    }

    if (type === 'batch_update_attr') {
      html += `<li>
        <label>${name.charAt(0).toUpperCase() + name.slice(1)}</label>
        <input id="${name}" name="${name}" class="">
        <label for="${name}_overwrite">overwrite?</label>
        <input id="${name}_overwrite" name="${name}_overwrite" class="" type="checkbox">
      </li>`;
    }
    else {
      var klass = type === 'datepicker' ? type : '';
      html += `<li>
        <label>${name.charAt(0).toUpperCase() + name.slice(1)}</label>
        <${wrapper} name="${name}" class="${klass}" type="${type}" ${type === 'multiple' && 'multiple size=10'}>` +
          (opts ? ((() => {
            const result = [];

            opts.forEach(v => {
              const $elem = $(`<${elem}/>`);
              if ($.isArray(v)) {
                $elem.text(v[0]).val(v[1]);
              } else {
                $elem.text(v);
              }
              result.push($elem.wrap('<div>').parent().html());
            });

            return result;
          })()).join('') : '') +
        `</${wrapper}>` +
      "</li>";
    }
    [wrapper, elem, opts, type, klass] = []; // unset any temporary variables
  }

  html += "</ul></form>";

  const form = $(html).appendTo('body');
  $('body').trigger('modal_dialog:before_open', [form]);

  form.dialog({
    modal: true,
    width: 600,
    open(_event, _ui) {
      $('body').trigger('modal_dialog:after_open', [form]);
    },
    dialogClass: 'active_admin_dialog',
    buttons: {
      OK() {
        callback($(this).serializeObject());
        $(this).dialog('close');
      },
      Cancel() {
        $(this).dialog('close').remove();
      }
    }
  });
}

export default ModalDialog;
