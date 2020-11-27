'use strict';

var _ = require('ep_etherpad-lite/static/js/underscore');
const shared = require('./shared');

// Bind the event handler to the toolbar buttons
exports.postAceInit = function (hookName, context) {
  const hs = $('#font-size select.size-selection');
  hs.on('change', function () {
    const value = $(this).val();
    const intValue = parseInt(value, 10);
    if (!_.isNaN(intValue)) {
      context.ace.callWithAce((ace) => {
        ace.ace_doInsertsizes(intValue);
      }, 'insertsize', true);
      hs.val('dummy');
    }
  });
  $('.font_size').hover(() => {
    $('.submenu > .size-selection').attr('size', 6);
    $('.submenu > #font-size').attr('size', 6);
  });
  $('.font-size-icon').click(() => {
    $('#font-size').toggle();
  });
};

// Our sizes attribute will result in a size:red... _yellow class
exports.aceAttribsToClasses = function (hookName, context) {
  if (context.key.indexOf('font-size:') !== -1) {
    const size = /(?:^| )font-size:([A-Za-z0-9]*)/.exec(context.key);
    return [`font-size:${size[1]}`];
  }
  if (context.key == 'font-size') {
    return [`font-size:${context.value}`];
  }
};


// Here we convert the class size:red into a tag
exports.aceCreateDomLine = function (hookName, context) {
  const cls = context.cls;
  const sizesType = /(?:^| )font-size:([A-Za-z0-9]*)/.exec(cls);

  let tagIndex;
  if (sizesType) tagIndex = _.indexOf(shared.sizes, sizesType[1]);


  if (tagIndex !== undefined && tagIndex >= 0) {
    const modifier = {
      extraOpenTags: '',
      extraCloseTags: '',
      cls,
    };
    return [modifier];
  }
  return [];
};

exports.aceInitialized = (hookName, context) => {
  // Passing a level >= 0 will set a sizes on the selected lines, level < 0 will remove it
  context.editorInfo.ace_doInsertsizes = (level) => {
    const {rep, documentAttributeManager} = context;
    if (!(rep.selStart && rep.selEnd)) return;
    if (level >= 0 && shared.sizes[level] === undefined) return;
    const newSize = ['font-size', level >= 0 ? shared.sizes[level] : ''];
    documentAttributeManager.setAttributesOnRange(rep.selStart, rep.selEnd, [newSize]);
  };
};

exports.aceEditorCSS = () => ['ep_font_size/static/css/size.css'];

exports.postToolbarInit = function (hookName, context) {
  const editbar = context.toolbar;

  editbar.registerCommand('fontSize', (buttonName, toolbar, item) => {
    $('#font-size').toggle();
  });
};
