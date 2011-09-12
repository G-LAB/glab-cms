<?php $this->load->view('finance/_journalselect') ?>
<table id="journal">
	<thead>
		<tr>
			<td>Date</td>
			<td>Account Name/Description</td>
			<td class="justr">Debit</td>
			<td class="justr">Credit</td>
		</tr>
	</thead>
	<tbody>
<?php foreach($journal as $entry) { ?>
		<tr>
			<td><?=date('M d',strtotime($entry['timestamp'])) ?></td>
			<td class="dr"><?=$entry['dracc'] ?></td>
			<td class="justr"><?=number_format($entry['amount'],2) ?></td>
			<td></td>
		</tr>
		<tr>
			<td><?=profile_link($entry['eidCreated'])?></td>
			<td class="cr"><?=$entry['cracc'] ?></td>
			<td></td>
			<td class="justr"><?=number_format($entry['amount'],2) ?></td>
		</tr>
		<tr>
			<td></td>
			<td colspan="3" class="memo"><?=$entry['memo'] ?></td>
		</tr>
		<tr>
			<td colspan="4"> </td>
		</tr>
<?php } ?>
	</tbody>
</table>