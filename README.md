# pilla-lib-mp3info

For more information, please visit the [githun](https://github.com/PerryWu/pilla-lib-mp3info)

__NOTE:__ Please have `mp3info` instatlled first.

## Steps
* Install mp3info

`apt-get install mp3info`

`npm install pilla-lib-mp3info`

* Have code example to get the mp3 info

```javascript
var mp3info = require('pilla-lib-mp3info');
mp3info(filePath, function(err, data) {
  console.log(data);
}); 
```
