var queryString = require('query-string');

var urlParams = queryString.parse(location.search);

// Set username in title
$('span#username').append( urlParams.username || 'demo' );

// Set items with questions and answers (scores)
var item = $('#parent-1 .item');
var scores = [];        

for (var i = 0; i < urlParams.scores.length; i += 2) {
    scores.push({
        question: urlParams.scores[i],
        answer: urlParams.scores[i + 1]
    })
};

var contentIndex = 1;
var questions = [
    [
        'NIKE biedt hoogwaardige producten aan.',
        'NIKE biedt producten aan die een goede prijs-kwaliteitsverhouding hebben.',
        'NIKE staat achter haar producten.',
        'NIKE voldoet aan de behoeften van de klant.'
    ],
    [
        'NIKE handelt verantwoordelijk om het milieu te beschermen.',
        'NIKE ondersteunt goede doelen.',
        'NIKE heeft een positieve invloed op de samenleving.'
    ],
    [
        'NIKE is open en transparant over de manier waarop het bedrijf werkt.',
        'NIKE gedraagt zich ethisch (gedraagt zich op een goede manier en doet geen foute dingen).',
        'NIKE is eerlijk in de manier waarop het zaken doet.'
    ]
]

scores.forEach(function(score, index) {
    if (! questions[contentIndex - 1].includes(score.question)) {
        $(`#parent-${contentIndex}`).after(`<div id="parent-${contentIndex + 1}" class="parent"><div class="content"></div></div>`);
        contentIndex++;
    }
    if (index !== 0) {
        item = item.clone().appendTo(`#parent-${contentIndex} .content`);
    }

    var slider = item.find('.graphic_scale .field input[type="range"]');
    slider.val( score.answer.toString() ).change();
    
    item.children('.statement').html( score.question.replace('NIKE', '<span class="bold italics">NIKE</span>' ) );
});

// Initialize a new plugin instance for all ('input[type="range"]') elements
$('input[type="range"]').rangeslider({
    polyfill: false,
    rangeClass: 'rangeslider',
    onInit : function() {
        this.sliderValueEl = $( '<div class="slider_value" />' ).insertBefore( this.$range );
        this.sliderValueEl.css({ left: this.position + 10 });
        this.output = $( '<span />' ).appendTo( this.sliderValueEl ).html( this.$element.val() );
    },
    onSlide : function( position, value ) {
        this.sliderValueEl.css({ left: position + 10 });
        this.output.html( value );
    }
});
