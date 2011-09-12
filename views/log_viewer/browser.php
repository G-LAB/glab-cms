<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Event</td>
				<td>When</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $row) : ?>
			<tr>
				<td><?=element('text',$row)?></td>
				<td><?=date_user(element('timestamp',$row))?></td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>