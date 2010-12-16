<div class="mid body">
	<table>
		<thead>
			<tr>
				<td>Server</td>
				<td>Web</td>
				<td>SSL</td>
				<td>POP</td>
				<td>IMAP</td>
				<td>SMTP</td>
				<td>FTP</td>
				<td>SSH</td>
				<td>Plesk</td>
				<td>Actions</td>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($data as $server) : ?>
			<tr>
				<td>
					<strong><?=element('server_name',$server)?></strong> <br/>
					<?=element('ip_address',$server)?>
				</td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_web',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_ssl',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_pop',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_imap',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_smtp',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_ftp',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_ssh',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td><img src="/images/backend/icons/Ball_<?=(element('status_plesk',$server)) ? 'Green' : 'Red'?>.png"/></td>
				<td>
					<a href="#" class="button">View</a>
				</td>
			</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>