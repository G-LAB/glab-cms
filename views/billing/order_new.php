<div class="mid header">
	<input type="search" name="q" class="floatr" id="entitySearchBox"/>
	<h4>Search for Account</h4>
</div>
<div class="mid body" id="results">
	<table>
		<thead>
			<tr>
				<td>Account Number</td>
				<td>Name</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td colspan="3">Enter a search query.</td>
			</tr>
		</tbody>
	</table>
</div>

<script id="tmplEntityRow" type="text/x-jquery-tmpl">
	<tr>
		<td>${acctnum}</td> 
		<td>${name}</td> 
		<td><a href="<?=current_url()?>/${eid}" class="button">New Order</a></td>
	</tr>
</script>
<script type="text/javascript">
	$( "#tmplEntityRow" ).template( "tmplEntityRow" );
	$('#entitySearchBox').keyup( function () {
	  $.post('/backend/billing/ajax/entities', {q: $("#entitySearchBox").val()}, function(data) {
	    $("#results tbody").text('');
	    $.tmpl("tmplEntityRow",data).appendTo( "#results tbody" );
	  }, "json");
	});
</script>