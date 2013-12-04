"use strict";

var Config = {
  convert: function (rawConfig) {
    var modifierCategories = Object.keys(rawConfig.modifiers);
    return {
      nouns: rawConfig.nouns,

      modifiers: modifierCategories.reduce(function (memo, category) {
        var convertedModifiers = rawConfig.modifiers[category].map(function (modifier) {
          return { value: modifier, category: category };
        });
        return memo.concat(convertedModifiers);
      }, [])
    };
  }
};

var Generator = {
  decorate: function (string, modifier) {
    switch (modifier.category) {
    case 'before':
      return modifier.value + ' ' + string;
    case 'after':
      return string + ' ' + modifier.value;
    case 'prefixes':
      return modifier.value + string;
    case 'suffixes':
      return string + modifier.value;
    }
  },

  randomFrom: function (list) {
    return list[Generator.randomNumber(list.length)];
  },

  randomNumber: function (max) {
    return Math.floor(Math.random() * max);
  },

  generate: function (config, string, probability) {
    string = string || Generator.randomFrom(config.nouns);
    probability = probability || 1;
    if (Generator.randomNumber(probability) === 0) {
      var modifier = Generator.randomFrom(config.modifiers);
      string = Generator.generate(config, Generator.decorate(string, modifier), probability + 1);
    }
    return string;
  }
};

$.getJSON('config.json', function (rawConfig) {
  var config = Config.convert(rawConfig),
    spaceKey = 32;

  function update(quote) {
    quote = quote || Generator.generate(config);

    $('.title').html(quote);
    document.title = 'Buzzword Generator - ' + quote;
    history.replaceState({}, 'Buzzword Generator', '?quote=' + encodeURIComponent(quote));
  }

  $(document).ready(function () {
    var quoteParam = $.url(window.location).param('quote');
    if (quoteParam) {
      update(quoteParam);
    } else {
      update();
    }
  }).keypress(function (event) {
    if (event.which === spaceKey) {
      update();
    }
  });
  $('.more-button').click(function () {
    update();
  });
});
