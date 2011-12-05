	 $(document).ready(function() {
	    $('#post_content').editable('<?=site_url('ajax/socialpost')?>',{
			type: 'textarea',
			data : "\b",
			submit: 'Send Update',
			callback: function () {
				$('#social_status #updated').html('just now');
			}
		});
	 });