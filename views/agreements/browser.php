<div class="mid body justr">
	<a href="#" class="button" id="btnNewAgreement">New Agreement</a>
</div>
<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>ID</td>
				<td>Name</td>
				<td>Last Updated</td>
				<td class="justr">Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $agreement) : ?>
			<tr>
				<td><?=leading_zeroes(element('agid',$agreement))?></td>
				<td><?=element('name',$agreement)?></td>
				<td><?=date_user(strtotime(element('tsUpdated',$agreement)))?></td>
				<td class="justr">
					<a href="<?=site_url('agreements/revisions/'.element('agid',$agreement))?>" class="button">View Revisions</a>
				</td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>

<div class="hide">
	<div id="dialogNewAgreement">
		<form>
			<label>Agreement Name</label>
			<input name="name"/>
		</form>
	</div>
</div>

<script type="text/javascript">
	$(function() {
		$("#dialogNewAgreement").dialog({
			autoOpen: false,
			autoHeight: true,
			width: 400,
			modal: true,
			resizable: false,
			title: 'Create New Agreement',
			buttons: {
				'Save Agreement': function() {
					var str = $("form",this).serialize();
					$.post("/backend/agreements/ajax/newAgreement", str,
					  function(data){
					    if (data) window.location = '/backend/agreements/revisions/' + data;
					});
					$(this).dialog('close');
				},
				Cancel: function() {
					$(this).dialog('close');
				}
			},
			close: function() {
				$("form",this)[0].reset();
			}
		});
		$("#btnNewAgreement").click(function () { 
				$("#dialogNewAgreement").dialog('open');
		});
	});
	
</script>