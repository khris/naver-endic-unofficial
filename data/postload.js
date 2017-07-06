self.port.on('height-calculated', function (calculatedHeight) {
    console.log('calculatedHeight: ' + calculatedHeight);
    $('#container').css('height', calculatedHeight);
});
$('body').css('background-color', '#ffffff');
