<table id="journal">
	<thead>
		<tr>
			<td>Check Number</td>
			<td>Payee</td>
			<td class="justr">Amount</td>
		</tr>
		<tr>
			<td>Date</td>
			<td colspan="2">Memo</td>
		</tr>
	</thead>
	<tbody>
<?php foreach($journal as $entry) { ?>
		<tr>
			<td><?php echo $entry['checknum'] ?></td>
			<td><a href="http://glabstudios.com/backend/index.php/profile/view/<?php echo $entry['payee_entity']['eid'] ?>" onclick="updateHUD(<?php echo $entry['payee_entity']['eid'] ?>)"><?php if ($entry['payee'] != null) echo $entry['payee']; else echo $entry['payee_entity']['name']; ?></a></td>
			<td class="justr"><?php echo number_format($entry['amount'],2) ?></td>
		</tr>
		<tr>
			<td><?php echo date('F j, Y',strtotime($entry['checkDate'])) ?></td>
			<td colspan="2"><?php echo $entry['memo'] ?></td>
		</tr>
<?php } ?>
	</tbody>
</table>