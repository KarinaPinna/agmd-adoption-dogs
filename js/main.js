jQuery(function($) {

    $.getJSON(
        ROOT_PATH + '/json/adopt.json',
        setAdoptionList
    )
    .error(error)
    .fail(fail);

    $('.product-selection select').on('change', changeAdoptionSelection);
    $('.product-selection .btn-add').on('click', btnAddAdoptionSelection);
    $('.product-selected').on('click', '.btn-view-adoption', showFancyBox);

});

window.adoptionData = {};
window.selectedAdoptionBoxBlock = null;
window.adoptionFancyboxContentBlock = null;
window.calculationAdoptionBoxBlock = null;
window.calculationTotalCaresCount = 0;

var setAdoptionList = function(json) {
    window.adoptionData = json['adoptions'];
    $.each(json['adoptions'], iterateAdoptionData);
}

var iterateAdoptionData = function(i, adoption) {
    window.adoptionData[i].descriptionNormalized =
            window.adoptionData[i].description.replace(/<[^>]*>/g, '');

    var option = $('<option />', {
        text: adoption.name,
        value: i
    });
    $('.product-selection select').append(option);
}

var error = function(jqxhr, status, error) {
    console.error(
        'Error: %status, %error'
            .replace('%status', status)
            .replace('%error', error)
    );
};

var fail = function(jqxhr, status, error) {
    console.error(
        'Request Failed: %status, %error'
            .replace('%status', status)
            .replace('%error', error)
    );
};

var changeAdoptionSelection = function(e) {
    e.preventDefault();
    var value = $(this).val();

    if (value != '-')
        $('.product-selection .btn-add').show();
    else
        $('.product-selection .btn-add').hide();
};

var btnAddAdoptionSelection = function(e) {
    e.preventDefault();
    var adoptionIndex = $('.product-selection select').val();
    var dogData = window.adoptionData[adoptionIndex];

    if (window.selectedAdoptionBoxBlock === null) {
        $.ajax({
            url: BLOCK_PATH + 'selected-adoption-box.html',
            method: 'GET',
            dataType: 'html',
            success: function(block) {
                window.selectedAdoptionBoxBlock = block;
                appendSelectedAdoption(adoptionIndex);
            },
            error: error
        });
    } else
        appendSelectedAdoption(adoptionIndex);
}

var appendSelectedAdoption = function(adoptionIndex) {
    var dogData = getDogData(adoptionIndex);

    var box = window.selectedAdoptionBoxBlock
        .replace(new RegExp('{{name}}', 'g'), dogData.raw.name)
        .replace(new RegExp('{{image}}', 'g'), dogData.image)
        .replace(new RegExp('{{index}}', 'g'), adoptionIndex)
        .replace(new RegExp('{{cares}}', 'g'), dogData.cares)
        .replace(new RegExp('{{brief-description}}', 'g'), dogData.briefDescription)
    ;

    $('.product-selected .row').append(box);
    window.calculationTotalCaresCount += parseInt(dogData.raw.care);
    appendCalculateTotalCares(dogData.cares);
}

var showFancyBox = function(e) {
    e.preventDefault();
    var adoptionIndex = $(this).data('index');

    if (window.adoptionFancyboxContentBlock === null) {
        $.ajax({
            url: BLOCK_PATH + 'adoption-fancybox-content.html',
            method: 'GET',
            dataType: 'html',
            success: function(block) {
                window.adoptionFancyboxContentBlock = block;
                showAdoptionFancybox(adoptionIndex);
            },
            error: error
        });
    } else
        showAdoptionFancybox(adoptionIndex);

    console.log($(this).data());
}

var showAdoptionFancybox = function(adoptionIndex) {
    var dogData = getDogData(adoptionIndex);

    $.fancybox(
        window.adoptionFancyboxContentBlock
            .replace(new RegExp('{{name}}', 'g'), dogData.raw.name)
            .replace(new RegExp('{{image}}', 'g'), dogData.image)
            .replace(new RegExp('{{cares}}', 'g'), dogData.cares)
            .replace(new RegExp('{{description}}', 'g'), dogData.raw.description)
        ,
        {fitToView: true}
    );
}

var appendCalculateTotalCares = function(cares) {
    $('.total-cares').append(cares);
    $('.total-cares-count').html(window.calculationTotalCaresCount);
}

var getDogData = function(adoptionIndex) {
    var dogData = window.adoptionData[adoptionIndex];
    var careObject = $('<div />', {class: 'heart octicon-heart'});
    var cares = '';
    for (var i = 0; i < dogData.care; i++) {
        cares += careObject.prop('outerHTML');
    }
    var image = ADOPTION_IMAGE_PATH + dogData.image;
    var briefDescription = dogData.descriptionNormalized.substring(0, 120);

    return {
        raw: dogData,
        cares: cares,
        image: image,
        briefDescription: briefDescription
    }
}
