// descriptor-admin.js
jQuery(document).ready(function($) {

    var wdescript_txt = '';

    $(document).on('click', '.wdescipt em', function(e){
        e.preventDefault();
        $(this).parent().remove();
    });

    // replace data
    $(document).on('click', '.wdescript-replace', function(e){
        e.preventDefault();

        wdescript_txt = $(this).parent().find('span').html();
        $(this).closest('.setting').find('textarea').val(wdescript_txt);        
        $(this).parent().fadeOut('fast');
        $(this).parent().remove();         
    });
    $(document).on('click', '.wdescript-replacet', function(e){
        e.preventDefault();
        
        wdescript_txt = $(this).parent().find('span').html();
        $(this).closest('.setting').find('input').val(wdescript_txt);        
        $(this).parent().fadeOut('fast');
        $(this).parent().remove();
    });

    // append data
    $(document).on('click', '.wdescript-append', function(e){
        e.preventDefault();

        wdescript_txt = $(this).parent().find('span').html();
        var $input = $(this).closest('.setting').find('textarea');
        var currentVal = $input.val();
        $input.val(currentVal + ' ' + wdescript_txt); 

        $(this).parent().fadeOut('fast');
        $(this).parent().remove();        
    });

    $(document).on('click', '.wdescript-appendt', function(e){
        e.preventDefault();

        wdescript_txt = $(this).parent().find('span').html();
        var $input = $(this).closest('.setting').find('input');
        var currentVal = $input.val();
        $input.val(currentVal + ' ' + wdescript_txt); 

        $(this).parent().fadeOut('fast');
        $(this).parent().remove();        
    });    

    $(document).on('click', '.wdescript-retry', function(e){
        e.preventDefault();

        var setting = $(this).closest('span.setting').data('setting');

        const $link         = $(document).find('.describe-attachment');
        const attachmentId  = parseInt($link.data('attachment-id'), 10);

        $(this).parent().addClass('pulsing');
        
        // var descriptions = get_descriptions(attachmentId, [setting]);        
        get_descriptions(attachmentId, [setting]).then((descriptions) => {

            var descriptionValue = descriptions[setting];
            $(this).closest('.pulsing').find('span').text(descriptionValue);
            $(this).parent().removeClass('pulsing');
        });

        // $(this).parent().fadeOut('fast');
    });
    
    // Whenever someone clicks "Describe Image"...
    $(document).on('click', '.describe-attachment', function(e){
        e.preventDefault();

        $(this).addClass('throbbing');

        const $link         = $(this);
        const attachmentId  = parseInt($link.data('attachment-id'), 10);

        // go to the server locally with admin-ajax.php 
		// const descriptions = get_descriptions(attachmentId);

        get_descriptions(attachmentId).then((descriptions) => {
            // console.log('line 79', descriptions);

            $(this).removeClass('throbbing');
            if (descriptions.alt.length > 1) {
                const $alttext = jQuery('#attachment-details-alt-text');
                if ($alttext.length) {
                    const alttextoffset = $alttext.offset();
                    const alttextleft   = alttextoffset.left;
                    const alttexttop    = alttextoffset.top;
                
                    // console.log('Alt Text left:', alttextleft, ' top:', alttexttop);
                
                    const $suggestAltDiv = jQuery('<div>', {
                        id: 'attachment-details-alt-text-suggest',
                        css: {
                            /* left: descriptionLeft + 'px', 
                            top: (descriptionTop - 32) + 'px', */ 
                            width: ($alttext.parent().width() - 10).toString() + 'px',
                        }
                    });
                
                    $alttext.after($suggestAltDiv);
                    $('#attachment-details-alt-text-suggest').fadeIn(100);
                    $suggestAltDiv.addClass('wdescipt');
                    var detailsAltSuggest = descriptions.alt;
                    $suggestAltDiv.html('<strong>Alt Text</strong><em>X</em><br/><span>' + detailsAltSuggest + '</span><br/><a href="#" id="alttext-replace" class="wdescript-replace">Use</a> <a href="#" id="alttext-append" class="wdescript-append">Append</a> <a href="#" id="alttext-retry" class="wdescript-retry">Try Again</a> <a href="#" id="alttext-problem">+</a>');
                }
            }
            if (descriptions.title.length > 1) {
                const $title = jQuery('#attachment-details-title');
                if ($title.length) {
                    const titleoffset = $title.offset();
                    const titleleft   = titleoffset.left;
                    const titletop    = titleoffset.top;
                
                    // console.log('Title left:', titleleft, ' top:', titletop);
                
                    const $suggestTitleDiv = jQuery('<div>', {
                        id: 'attachment-details-title-suggest',
                        css: {
                            /* left: descriptionLeft + 'px',  
                            top: (titletop - 32) + 'px',*/ 
                            width: ($title.parent().width() - 10).toString() + 'px',
                        }
                    });
                
                    $title.after($suggestTitleDiv);
                    $('#attachment-details-title-suggest').fadeIn(120);
                    $suggestTitleDiv.addClass('wdescipt');
                    var detailsTitleSuggest = descriptions.title;
                    $suggestTitleDiv.html('<strong>Title</strong><em>X</em><br/><span>' + detailsTitleSuggest + '</span><br/><a href="#" id="title-replace" class="wdescript-replacet">Use</a> <a href="#" id="title-append" class="wdescript-appendt">Append</a> <a href="#" id="title-retry" class="wdescript-retry">Try Again</a> <a href="#" id="title-problem">+</a>');
                }
            }

            if (descriptions.caption.length > 1) {        
                const $caption = jQuery('#attachment-details-caption');
                if ($caption.length) {
                    const captionoffset = $caption.offset();
                    const captionleft   = captionoffset.left;
                    const captiontop    = captionoffset.top;
                
                    // console.log('Alt Text left:', captionleft, ' top:', captiontop);
                
                    const $suggestCaptionDiv = jQuery('<div>', {
                        id: 'attachment-details-description-suggest',
                        css: {
                            /* left: descriptionLeft + 'px', 
                            top: (captiontop - 16) + 'px', */ 
                            width: ($caption.parent().width() - 10).toString() + 'px',
                            height: '160px'
                        }
                    });
                
                    $caption.after($suggestCaptionDiv);
                    $('#attachment-details-caption-suggest').fadeIn(140);
                    $suggestCaptionDiv.addClass('wdescipt');
                    var detailsCaptionSuggest = descriptions.caption;
                    $suggestCaptionDiv.html('<strong>Caption</strong><em>X</em><br/><span>' + detailsCaptionSuggest + '</span><br/><a href="#" id="caption-replace" class="wdescript-replace">Use</a> <a href="#" id="caption-append" class="wdescript-append">Append</a> <a href="#" id="caption-retry" class="wdescript-retry">Try Again</a> <a href="#" id="caption-problem">+</a>');
                }
            }

            if (descriptions.description.length > 1) {        
                const $description = jQuery('#attachment-details-description');
                if ($description.length) {
                    const descriptionOffset = $description.offset();
                    const descriptionLeft = descriptionOffset.left;
                    const descriptionTop = descriptionOffset.top;
                
                    // console.log('Decription left:', descriptionLeft, ' top:', descriptionTop);
                
                    const $suggestDescriptDiv = jQuery('<div>', {
                        id: 'attachment-details-description-suggest',
                        css: {
                            /* left: descriptionLeft + 'px', 
                            top: (descriptionTop - 32) + 'px', */ 
                            width: ($description.parent().width() - 10).toString() + 'px',
                            height: '160px'
                        }
                    });
                
                    $description.after($suggestDescriptDiv);
                    $('#attachment-details-description-suggest').fadeIn(160);
                    $suggestDescriptDiv.addClass('wdescipt');
                    var detailsDescriptSuggest = descriptions.description;
                    $suggestDescriptDiv.html('<strong>Description</strong><em>X</em><br/><span>' + detailsDescriptSuggest + '</span><br/><a href="#" id="description-replace" class="wdescript-replace">Use</a> <a href="#" id="description-append" class="wdescript-append">Append</a> <a href="#" id="description-retry" class="wdescript-retry">Try Again</a> <a href="#" id="description-problem">+</a>');
                }
            }

          
        }).catch((error) => {
          console.error('Error:', error);
        });



/*
#attachment-details-alt-text-suggest,
#attachment-details-title-suggest,
#attachment-details-caption-suggest,
#attachment-details-description-suggest {
    position: absolute;
    z-index: 999999;
}
*/

        if (!attachmentId) {
            alert('No valid attachment ID found.');
            return;
        }

        // 1) Get the WP attachment model
        const model = wp.media.attachment(attachmentId);

        // 2) If it’s not already in memory, fetch() will load it
        //    from the server asynchronously.
        model.fetch().then(() => {
            // 3) Now we can get the URL from the model
            const imageUrl = model.get('url');

            // Example: show it in console/log
            // console.log('Image URL:', imageUrl);

            // Next steps: 
            // - AJAX call to your own endpoint
            // - Or open a new modal to display the info
            // - Or do something else with `imageUrl`
        }).catch(err => {
            console.error('Error fetching attachment model:', err);
        });
    });


    /**
     * Function to append "Describe Image" links in any newly added .attachment-details
     */
    function addDescribeLinks($container) {
        // Within the given container (which might be .attachment-details or a parent),
        // find all a.edit-attachment.
        $container.find('.attachment-info a.edit-attachment').each(function() {
            // Skip if we’ve already processed this link
            if (!$(this).hasClass('wd-processed')) {
                $(this).addClass('wd-processed');

     
                // 1) Parse the attachment ID from the "Edit Image" link's href
                const href  = $(this).attr('href') || '';
                const match = href.match(/post=(\d+)/);
                const attachmentId = match ? parseInt(match[1], 10) : 0;
        
                // 2) Insert "Describe Image" link with data-attachment-id
                $(this).after(`
                    <a href="#" 
                       class="describe-attachment" 
                       data-attachment-id="${attachmentId}" 
                       style="margin-left: 8px;"
                    >
                       Describe Image
                    </a>
                `);
            }
        });
    }

    function get_descriptions(attachment, fields = ['alt', 'title', 'caption', 'description']) {
      return new Promise((resolve, reject) => {
        jQuery.ajax({
          url: w321descritptor.ajax_url,
          method: 'POST',
          dataType: 'json',
          data: {
            action: 'w321get_descriptions',
            nonce: w321descritptor.descriptor_nonce,
            attachment: attachment,
            fields: fields
          },
          success: function(response) {
            if (response.success) {
              resolve(response.data);
            } else {
              reject({ error: response.data.error || 'Unknown error from server.' });
            }
          },
          error: function(xhr, status, error) {
            reject({ error: error });
          }
        });
      });
    }



    /**
     * Set up the MutationObserver to watch for elements being added anywhere in <body>.
     */
    const observer = new MutationObserver(function(mutationsList) {
        mutationsList.forEach(mutation => {
            // We only care about added nodes
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(addedNode => {
                    // If the node is an ELEMENT (not text)
                    if (addedNode.nodeType === Node.ELEMENT_NODE) {
                        const $added = $(addedNode);

                        // Case 1: The node *itself* is .attachment-details
                        if ($added.is('.attachment-details')) {
                            addDescribeLinks($added);
                        }
                        // Case 2: The node *contains* .attachment-details somewhere inside
                        else {
                            const $descendants = $added.find('.attachment-details');
                            if ($descendants.length > 0) {
                                addDescribeLinks($descendants);
                            }
                        }
                    }
                });
            }
        });
    });

    // Start observing <body> for added child elements (including all subtrees)
    observer.observe(document.body, { childList: true, subtree: true });

});