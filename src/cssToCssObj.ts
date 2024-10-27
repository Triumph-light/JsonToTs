function delSpace(str: string): string {
    return str.replace(/ +/g, '')
}

function convertToCamelCase(str: string) {
    return delSpace(str).replace(/-(.)/g, function (match, group1) {
      return group1.toUpperCase();
    });
}

export function cssToJson(styleString: string) {
    var styleObj: Record<string, any> = {};
    var stylePairs = styleString.split(';');
    for (var i = 0; i < stylePairs.length; i++) {
      var pair = delSpace(stylePairs[i]);
      if (pair) {
        var keyValue = pair.split(':');
        var key = keyValue[0].trim();
        var value = keyValue[1].trim();
        styleObj[convertToCamelCase(key)] = value;
      }
    }
    return JSON.stringify(styleObj);
  }