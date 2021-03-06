(function() {
  var PDFDocument, doc, loremIpsum, part, tiger, _i, _len;

  PDFDocument = require('pdfkit');

  tiger = require('./tiger');

  doc = new PDFDocument;

  doc.info['Title'] = 'Test Document';

  doc.info['Author'] = 'Devon Govett';

  doc.registerFont('Palatino', 'fonts/PalatinoBold.ttf');

  doc.font('Palatino').fontSize(25).text('Some text with an embedded font!', 100, 100).fontSize(18).text('PNG and JPEG images:').image('images/test.png', 100, 160, {
    width: 412
  }).image('images/test.jpeg', 190, 400, {
    height: 300
  });

  doc.addPage().fontSize(25).text('Here is some vector graphics...', 100, 100);

  doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill("#FF3300");

  doc.circle(280, 200, 50).fill("#6600FF");

  doc.scale(0.6).translate(470, -380).path('M 250,75 L 323,301 131,161 369,161 177,301 z').fill('red', 'even-odd').restore();

  loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;\nMauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.';

  doc.text('And here is some wrapped text...', 100, 300).font('Helvetica', 13).moveDown().text(loremIpsum, {
    width: 412,
    align: 'justify',
    indent: 30,
    paragraphGap: 5
  });

  doc.addPage().font('Palatino', 25).text('Rendering some SVG paths...', 100, 100).translate(220, 300);

  for (_i = 0, _len = tiger.length; _i < _len; _i++) {
    part = tiger[_i];
    doc.save();
    doc.path(part.path);
    if (part['stroke-width']) {
      doc.lineWidth(part['stroke-width']);
    }
    if (part.fill !== 'none' && part.stroke !== 'none') {
      doc.fillAndStroke(part.fill, part.stroke);
    } else {
      if (part.fill !== 'none') {
        doc.fill(part.fill);
      }
      if (part.stroke !== 'none') {
        doc.stroke(part.stroke);
      }
    }
    doc.restore();
  }

  doc.addPage().fillColor("blue").text('Here is a link!', 100, 100).underline(100, 100, 160, 27, {
    color: "#0000FF"
  }).link(100, 100, 160, 27, 'http://google.com/');

  doc.fillColor('#000').font('fonts/Chalkboard.ttc', 'Chalkboard', 16).list(['One', 'Two', 'Three'], 100, 150);

  doc.write('out.pdf');

}).call(this);
