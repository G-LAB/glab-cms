<?php if ($thisAccount['bank_type'] == 'c') : ?>
	<a href="<?php echo site_url('finance/check/write/'.$thisAccount['acctnum']) ?>" class="button" id="writeCheck">Write Check</a>
<?php endif; ?>

<?php $this->load->view('finance/_journalselect') ?>

<table id="journal">
	<thead>
		<tr>
			<td>Date</td>
			<td>Memo</td>
			<td class="justr">Debit</td>
			<td class="justr">Credit</td>
		</tr>
	</thead>
	<tbody>
<?php foreach($journal as $entry) { ?>
		<tr>
			<td><?php echo date('M d',strtotime($entry['timestamp'])) ?></td>
			<td class="dr">
				<?php if ($entry['memo']) : echo $entry['memo'] ?>
				<?php elseif ($entry['ivimid']) : echo 'Invoice Item #'.$entry['ivimid'] ?>
				<?php endif; ?>
			</td>
			<td class="justr"><?php if ($entry['acid_debit'] == $acid) echo number_format($entry['amount'],2) ?></td>
			<td class="justr"><?php if ($entry['acid_credit'] == $acid) echo number_format($entry['amount'],2) ?></td>
		</tr>
<?php } ?>
	</tbody>
</table>