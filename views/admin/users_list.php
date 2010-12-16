<form action="<?=current_url()?>" method="post" id="admin_form">
	<div class="mid body">
		<h4>Promote User to Administrator</h4>
		
		<?=validation_errors()?>
		<input type="hidden" name="action" value="add_admin"/>
		
		<label for="entity_search">Search User Database</label>
		<input type="text" name="eid" id="entity_search"/>
		
		<button action="submit">Add New Admin</button>
	</div>
</form>

<?php foreach($admins as $admin): ?>
<?php $blist = array('isCompany','logo','companyName'); ?>
<div class="mid body">
	<h4><?=$admin['firstName']?></h4>
	<table>
		<thead>
			<tr>
				<td>Item</td>
				<td>Value</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($admin as $item=>$value) if (! in_array($item,$blist)) : ?>
			<tr>
				<td><?=$item?></td>
				<td><?=$value?></td>
			</tr>
			<?php endif; ?>
		</tbody>
	</table><br/>
	<form action="<?=current_url()?>" method="post">
		<input type="hidden" name="eid" value="<?=$admin['eid']?>" />
		<div class="justr">
			<a href="<?=site_url('profile/view/'.$admin['eid'])?>" class="button">View User Profile</a>
			<?php if ($admin['ykid'] > 0) : ?>
			<button action="submit" name="action" value="drop_yubikey" class="red">Drop Yubikey</button>
			<?php else : ?>
			<a href="<?=site_url('admin/assign_yubikey/'.$admin['eid'])?>" class="button">Assign Yubikey</a>
			<?php endif; ?>
			<button action="submit" name="action" value="drop_admin" class="red">Remove as Admin</button>
		</div>
	</form>
</div>
<?php endforeach; ?>

<script type="text/javascript">
	$(function() {
			$("#entity_search").autocomplete({
						source: "/backend/index.php?c=autocomplete&m=entitySearch",
						minLength: 2,
						close: function(event, ui) {
							$('#admin_form').submit();
						}
					});
		});
</script>