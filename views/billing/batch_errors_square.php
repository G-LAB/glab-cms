<table>
	<thead>
		<tr>
			<td>Transaction ID</td>
			<td>Timestamp</td>
			<td>Total Sale</td>
			<td>Error</td>
			<td>Actions</td>
		</tr>
	</thead>
	<tbody>
		<?php foreach ($errors as $error) : ?>
		<tr>
			<td><?=element('transid', $error)?></td>
			<td><?=date_user(element('timestamp', $error))?></td>
			<td class="justr"><?=number_format(element('amount', $error), 2)?></td>
			<td>Invalid invoice number (<?=element('ivid', $error)?>)</td>
			<td><button>Fix Error</button></td>
		</tr>
		<?php endforeach; ?>
	</tbody>
</table>