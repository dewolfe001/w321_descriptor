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

    $(document).on('click', '.describe-help', function(e) {
        $('.describe-help').fadeOut('slow');
        return;
    });
    
    // Whenever someone clicks "Describe Image"...
    $(document).on('click', '.describe-attachment, .describe-link', function(e){
        e.preventDefault();
        $('.describe-help').hide();

        if (w321descritptor.account_status != 1) {
            const helpout = '<br/><a href="https://descriptor.web321.co/dashboard/" class="describe-help" target="_blank">You need to finish your Descriptor setup. - Click Here</a>';
            $(this).parent().append(helpout); 
            $(this).css('margin-bottom', '16px');
            $('.describe-help').fadeIn('fast');
            return;
        }
     
        $(this).addClass('throbbing');

        const $link         = $(this);
        
        var editAttachmentUrl = $(this).closest('.details').find('.edit-attachment').attr('href');
        var attachmentId  = parseInt($link.data('attachment-id'), 10);

        if (editAttachmentUrl) {
            // Use URLSearchParams to parse the URL and get the `post` parameter
            const urlParams = new URLSearchParams(editAttachmentUrl.split('?')[1]); // Get query part of the URL
            attachmentId = urlParams.get('post'); // Extract the `post` parameter
        }
        else {
            // the upload link itsef
            editAttachmentUrl = $(this).attr('href');
            const urlParams = new URLSearchParams(editAttachmentUrl.split('?')[1]); // Get query part of the URL
            attachmentId = urlParams.get('item'); // Extract the `post` parameter            
        }

        // go to the server locally with admin-ajax.php 
		// const descriptions = get_descriptions(attachmentId);

        get_descriptions(attachmentId).then((descriptions) => {
            // console.log('line 79', descriptions);

            $(this).removeClass('throbbing');
            if (descriptions.alt.length > 1) {
                const possibleAltText = [
                    'attachment-details-alt-text',
                    'attachment-details-two-column-alt-text',
                    'attachment-details-one-column-alt-text'
                    ];

                    // Use a jQuery selector to find elements with any of the IDs
                    const $alttext = $(possibleAltText.map(id => `#${id}`).join(','));
                
                    // Check if we found any matching elements
                    if ($alttext.length > 0) {
                        // Perform your logic on the matched element(s)
                        $alttext.each(function() {
                            console.log('Found alt text field:', $(this));
                            // Example: Add a placeholder
                            const alttextoffset = $(this).offset();
                            const alttextleft   = alttextoffset.left;
                            const alttexttop    = alttextoffset.top;
                        
                            // console.log('Alt Text left:', alttextleft, ' top:', alttexttop);
                        
                            const $suggestAltDiv = jQuery('<div>', {
                                id: 'attachment-details-alt-text-suggest',
                                css: {
                                    /* left: descriptionLeft + 'px', 
                                    top: (descriptionTop - 32) + 'px', */ 
                                    width: ($(this).parent().width() - 10).toString() + 'px',
                                }
                            });
                        
                            $(this).after($suggestAltDiv);
                            $('#attachment-details-alt-text-suggest').fadeIn(100);
                            $suggestAltDiv.addClass('wdescipt');
                            var detailsAltSuggest = descriptions.alt;
                            $suggestAltDiv.html('<strong>Alt Text</strong><em>X</em><br/><span>' + detailsAltSuggest + '</span><br/><a href="#" id="alttext-replace" class="wdescript-replace">Use</a> <a href="#" id="alttext-append" class="wdescript-append">Append</a> <a href="#" id="alttext-retry" class="wdescript-retry">Try Again</a> <a href="#" id="alttext-problem">+</a>');
							});
                    } else {
                        console.log('No alt text field found.');
                    }
            }
            if (descriptions.title.length > 1) {
                const possibleTitle = [
                    'attachment-details-title',
                    'attachment-details-two-column-title',
                    'attachment-details-one-column-title'
                    ];

				const $title = $(possibleTitle.map(id => `#${id}`).join(','));
			
				// Check if we found any matching elements
				if ($title.length > 0) {
					// Perform your logic on the matched element(s)
					$title.each(function() {
						const titleoffset = $(this).offset();
						const titleleft   = titleoffset.left;
						const titletop    = titleoffset.top;
					
						// console.log('Title left:', titleleft, ' top:', titletop);
					
						const $suggestTitleDiv = jQuery('<div>', {
							id: 'attachment-details-title-suggest',
							css: {
								/* left: descriptionLeft + 'px',  
								top: (titletop - 32) + 'px',*/ 
								width: ($(this).parent().width() - 10).toString() + 'px',
							}
						});
					
						$(this).after($suggestTitleDiv);
						$('#attachment-details-title-suggest').fadeIn(120);
						$suggestTitleDiv.addClass('wdescipt');
						var detailsTitleSuggest = descriptions.title;
						$suggestTitleDiv.html('<strong>Title</strong><em>X</em><br/><span>' + detailsTitleSuggest + '</span><br/><a href="#" id="title-replace" class="wdescript-replacet">Use</a> <a href="#" id="title-append" class="wdescript-appendt">Append</a> <a href="#" id="title-retry" class="wdescript-retry">Try Again</a> <a href="#" id="title-problem">+</a>');
					});
				} else {
					console.log('No title field found.');
				}
            }

            if (descriptions.caption.length > 1) {        
                const possibleCaption = [
                    'attachment-details-caption',
                    'attachment-details-two-column-caption',
                    'attachment-details-one-column-caption'
                    ];

                    // Use a jQuery selector to find elements with any of the IDs
                    const $caption = $(possibleCaption.map(id => `#${id}`).join(','));

                    // Check if we found any matching elements
                    if ($caption.length > 0) {
                        // Perform your logic on the matched element(s)
                        $caption.each(function() {
							const captionoffset = $(this).offset();
							const captionleft   = captionoffset.left;
							const captiontop    = captionoffset.top;
						
							// console.log('Alt Text left:', captionleft, ' top:', captiontop);
						
							const $suggestCaptionDiv = jQuery('<div>', {
								id: 'attachment-details-description-suggest',
								css: {
									/* left: descriptionLeft + 'px', 
									top: (captiontop - 16) + 'px', */ 
									width: ($(this).parent().width() - 10).toString() + 'px',
									height: '160px'
								}
							});
                
							$(this).after($suggestCaptionDiv);
							$('#attachment-details-caption-suggest').fadeIn(140);
							$suggestCaptionDiv.addClass('wdescipt');
							var detailsCaptionSuggest = descriptions.caption;
							$suggestCaptionDiv.html('<strong>Caption</strong><em>X</em><br/><span>' + detailsCaptionSuggest + '</span><br/><a href="#" id="caption-replace" class="wdescript-replace">Use</a> <a href="#" id="caption-append" class="wdescript-append">Append</a> <a href="#" id="caption-retry" class="wdescript-retry">Try Again</a> <a href="#" id="caption-problem">+</a>');
						});
                }
            }

            if (descriptions.description.length > 1) {        
                const possibleDescription = [
                    'attachment-details-description',
                    'attachment-details-two-column-description',
                    'attachment-details-one-column-description'
                    ];

                    // Use a jQuery selector to find elements with any of the IDs
                    const $description = $(possibleDescription.map(id => `#${id}`).join(','));

                    if ($description.length > 0) {
                        // Perform your logic on the matched element(s)
                        $description.each(function() {
                            console.log('Found description field:', $(this));

							const descriptionOffset = $(this).offset();
							const descriptionLeft = descriptionOffset.left;
							const descriptionTop = descriptionOffset.top;
                
							// console.log('Decription left:', descriptionLeft, ' top:', descriptionTop);
						
							const $suggestDescriptDiv = jQuery('<div>', {
								id: 'attachment-details-description-suggest',
								css: {
									/* left: descriptionLeft + 'px', 
									top: (descriptionTop - 32) + 'px', */ 
									width: ($(this).parent().width() - 10).toString() + 'px',
									height: '160px'
								}
							});
						
							$(this).after($suggestDescriptDiv);
							$('#attachment-details-description-suggest').fadeIn(160);
							$suggestDescriptDiv.addClass('wdescipt');
							var detailsDescriptSuggest = descriptions.description;
							$suggestDescriptDiv.html('<strong>Description</strong><em>X</em><br/><span>' + detailsDescriptSuggest + '</span><br/><a href="#" id="description-replace" class="wdescript-replace">Use</a> <a href="#" id="description-append" class="wdescript-append">Append</a> <a href="#" id="description-retry" class="wdescript-retry">Try Again</a> <a href="#" id="description-problem">+</a>');
						});
                }
            }

          
        }).catch((error) => {
            console.error('Error:', error);
            const errorMsg = error.error;
        
            // Remove the 'throbbing' class
            $(this).removeClass('throbbing');
        
            // Add the error message to the DOM
            const helpout = `<br/><span class="describe-help" target="_blank">${errorMsg}</span>`;
            $(this).parent().append(helpout); 
            $(this).css('margin-bottom', '16px');
            $('.describe-help').fadeIn('fast');
        });

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
     * Function to append "Describe Image" links near edit attachment links.
     */
    function addDescribeLinksToEditAttachments($container) {
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
            try {
              const response = JSON.parse(xhr.responseText);
            
              // Safely access the nested error property
              const errorMessage = response?.data?.error || 'Unknown error';
              console.log('LINE 388 ' + errorMessage);
              error = errorMessage;      
            } catch (e) {
              // console.error('Failed to parse JSON:', e);
            }              
             
            reject({ error: error });
          }
        });
      });
    }

    function get_selected_attachments() {
        const ids = new Set();

        $('tbody th.check-column input[type="checkbox"]:checked').each(function() {
            const val = parseInt($(this).val(), 10);
            if (val) {
                ids.add(val);
            }
        });

        $('.attachments .attachment[aria-checked="true"]').each(function() {
            const val = parseInt($(this).data('id'), 10);
            if (val) {
                ids.add(val);
            }
        });

        return Array.from(ids);
    }

    function bulk_descriptions(attachments, fields = ['alt', 'title', 'caption', 'description']) {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: w321descritptor.ajax_url,
                method: 'POST',
                dataType: 'json',
                data: {
                    action: 'w321_bulk_descriptions',
                    nonce: w321descritptor.descriptor_nonce,
                    attachments: attachments,
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
                    try {
                        const response = JSON.parse(xhr.responseText);
                        const errorMessage = response?.data?.error || 'Unknown error';
                        error = errorMessage;
                    } catch (e) {
                        // ignore
                    }

                    reject({ error: error });
                }
            });
        });
    }

    function handle_bulk_describe(e) {
        e.preventDefault();
        $('.describe-help').hide();

        if (w321descritptor.account_status != 1) {
            const helpout = '<br/><a href="https://descriptor.web321.co/dashboard/" class="describe-help" target="_blank">You need to finish your Descriptor setup. - Click Here</a>';
            $(this).parent().append(helpout);
            $(this).css('margin-bottom', '16px');
            $('.describe-help').fadeIn('fast');
            return;
        }

        const attachmentIds = get_selected_attachments();
        const $button = $(this);
        const $status = $button.siblings('.describe-bulk-status');

        if (!attachmentIds.length) {
            alert('Select at least one image to describe.');
            return;
        }

        $button.prop('disabled', true).addClass('throbbing');
        $status.text('Working...').addClass('describe-bulk-status--active');

        bulk_descriptions(attachmentIds).then((result) => {
            const updatedCount = result.updated ? result.updated.length : 0;
            const errorCount = result.errors ? Object.keys(result.errors).length : 0;
            let message = `Updated ${updatedCount} image${updatedCount === 1 ? '' : 's'}.`;

            if (errorCount > 0) {
                message += ` ${errorCount} failed.`;
            }

            $status.text(message);
        }).catch((error) => {
            const errorMsg = error.error || 'Unknown error';
            $status.text(errorMsg);
        }).finally(() => {
            $button.prop('disabled', false).removeClass('throbbing');
            $status.addClass('describe-bulk-status--active');
        });
    }

    /**
     * Function to initialize the MutationObserver
     */
    function initializeObserver() {
        const targetNode = document.body; // Observe changes on the entire body

        // Define the MutationObserver callback
        const observerCallback = function(mutationsList) {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(addedNode => {
                        // Check if the added node is an element
                        if (addedNode.nodeType === Node.ELEMENT_NODE) {
                            const $added = $(addedNode);

                            // If the node or its descendants contain .attachment-info .details
                            if ($added.is('.attachment-info .details')) {
                                addDescribeLinksToDetails($added);
                                addDescribeLinksToEditAttachments($added);
                            } else {
                                const $descendants = $added.find('.attachment-info .details');
                                if ($descendants.length > 0) {
                                    addDescribeLinksToDetails($descendants);
                                }
                                addDescribeLinksToEditAttachments($added);
                            }
                        }
                    });
                }
            });
        };

        // Create a new MutationObserver instance
        const observer = new MutationObserver(observerCallback);

        // Start observing the target node with configuration
        observer.observe(targetNode, {
            childList: true,
            subtree: true // Monitor all descendants of the target
        });

        console.log('MutationObserver initialized.');
    }

    /**
     * Function to append "Describe" links to .attachment-info .details
     */
    function addDescribeLinksToDetails($elements) {
        $elements.each(function() {
            const $this = $(this);

            // Ensure we don't append the link multiple times
            if (!$this.find('.describe-link').length) {
                const currentUrl = window.location.href;

                // Build the "Describe" link with the current URL as a parameter
                const describeLink = `<a href="${currentUrl}" class="describe-link" target="_blank">Describe</a>`;
                $this.append(describeLink); // Append the link to the .details element
            }
        });

        console.log('"Describe" link added to .attachment-info .details.');
    }

    function add_bulk_describe_button() {
        const $listContainer = $('.tablenav.top .actions');
        if ($listContainer.length && !$listContainer.find('.describe-bulk-button').length) {
            $listContainer.append('<button type="button" class="button describe-bulk-button">Describe Selected</button><span class="describe-bulk-status"></span>');
        }

        const $gridContainer = $('.media-toolbar-secondary');
        if ($gridContainer.length && !$gridContainer.find('.describe-bulk-button').length) {
            $gridContainer.append('<button type="button" class="button describe-bulk-button">Describe Selected</button><span class="describe-bulk-status"></span>');
        }
    }

    /**
     * Check if we are on the appropriate page and initialize accordingly
     */
    const currentPage = window.location.pathname;

    if (currentPage.includes('upload.php') || currentPage.includes('post.php')) {
        console.log('Initializing MutationObserver for Media Library or Post Editor.');
        initializeObserver();
        addDescribeLinksToEditAttachments($(document));
        addDescribeLinksToDetails($('.attachment-info .details'));
        add_bulk_describe_button();
    }

    $(document).on('click', '.describe-bulk-button', handle_bulk_describe);

});
